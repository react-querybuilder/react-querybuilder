import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintStream;
import java.nio.charset.StandardCharsets;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

import org.springframework.expression.EvaluationContext;
import org.springframework.expression.Expression;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.PropertyAccessor;
import org.springframework.expression.TypedValue;
import org.springframework.expression.AccessException;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;

/**
 * Real Spring Expression Language (SpEL) evaluator backend.
 *
 * Reads a JSON array of records (`--json`), a SpEL query (`--query`), and an (unused) typemap
 * (`--types`) from the command line. Each record is a `Map` used as the evaluation root; a single
 * custom {@link MapAccessor} resolves the bare field identifiers that `formatQuery('spel')` emits by
 * default (both top-level fields and nested object-match fields relative to `#this`).
 *
 * The accessor also drives the null semantics: a missing key is unreadable, so SpEL throws and the
 * row is skipped (matching CEL/spel2js "missing field -> skip"); a present key with a null value
 * reads as null (so genuine `field == null` checks work). No indexer syntax, StrictMap, or custom
 * comparator needed.
 *
 * Two modes:
 *   - One-shot: `--json=... --query=... --types=...` -> prints one JSON array and exits.
 *   - Server (`--server`): reads one JSON request object per line from stdin
 *     (`{"data":[...],"query":"..."}`) and writes one JSON result array per line to stdout, until
 *     EOF. This amortizes JVM startup across an entire test file (one process per suite) instead of
 *     paying ~0.4s startup per query.
 */
public class SpelEvaluator {
  /**
   * Minimal PropertyAccessor resolving bare identifiers against java.util.Map keys. Depends only on
   * spring-expression (no spring-context / no built-in MapAccessor).
   */
  static class MapAccessor implements PropertyAccessor {
    @Override
    public Class<?>[] getSpecificTargetClasses() {
      return new Class<?>[] { Map.class };
    }

    @Override
    public boolean canRead(EvaluationContext context, Object target, String name) {
      // Only a present key is readable. A missing key is unreadable, so SpEL throws and the row is
      // skipped - matching CEL/spel2js "missing field -> skip". A present key with a null value
      // still reads as null (needed for explicit `field == null` checks).
      return target instanceof Map && ((Map<?, ?>) target).containsKey(name);
    }

    @Override
    public TypedValue read(EvaluationContext context, Object target, String name) {
      Map<?, ?> map = (Map<?, ?>) target;
      return new TypedValue(map.get(name));
    }

    @Override
    public boolean canWrite(EvaluationContext context, Object target, String name) {
      return false;
    }

    @Override
    public void write(EvaluationContext context, Object target, String name, Object newValue)
        throws AccessException {
      throw new AccessException("write not supported");
    }
  }

  static String argValue(String[] args, String flag) {
    String prefix = flag + "=";
    for (String arg : args) {
      if (arg.startsWith(prefix)) {
        return arg.substring(prefix.length());
      }
    }
    return null;
  }

  static final ObjectMapper MAPPER = new ObjectMapper();
  static final ExpressionParser PARSER = new SpelExpressionParser();

  /** Evaluates `query` against each record, returning the subset for which it is Boolean true. */
  static List<Map<String, Object>> filter(List<Map<String, Object>> data, String query) {
    Expression expression = PARSER.parseExpression(query);
    List<Map<String, Object>> results = new ArrayList<>();
    for (Map<String, Object> record : data) {
      StandardEvaluationContext context = new StandardEvaluationContext(record);
      context.addPropertyAccessor(new MapAccessor());
      try {
        Boolean value = expression.getValue(context, Boolean.class);
        if (Boolean.TRUE.equals(value)) {
          results.add(record);
        }
      } catch (Exception e) {
        // Non-matching / unresolvable records are treated as false, matching JS backend behavior.
      }
    }
    return results;
  }

  public static void main(String[] args) throws Exception {
    boolean server = false;
    for (String arg : args) {
      if (arg.equals("--server")) {
        server = true;
      }
    }

    if (server) {
      runServer();
      return;
    }

    String json = argValue(args, "--json");
    String query = argValue(args, "--query");
    // typemap accepted for contract parity but unused (Jackson-parsed types compare natively).
    List<Map<String, Object>> data =
        MAPPER.readValue(json, new TypeReference<List<Map<String, Object>>>() {});
    System.out.println(MAPPER.writeValueAsString(filter(data, query)));
  }

  /** Server loop: one JSON request object per input line, one JSON result array per output line. */
  static void runServer() throws Exception {
    BufferedReader in = new BufferedReader(new InputStreamReader(System.in, StandardCharsets.UTF_8));
    PrintStream out = new PrintStream(System.out, true, "UTF-8");
    String line;
    while ((line = in.readLine()) != null) {
      if (line.isEmpty()) {
        continue;
      }
      Map<String, Object> request =
          MAPPER.readValue(line, new TypeReference<Map<String, Object>>() {});
      // `data` re-parsed via convertValue to preserve the Map<String,Object> record shape.
      List<Map<String, Object>> data =
          MAPPER.convertValue(
              request.get("data"), new TypeReference<List<Map<String, Object>>>() {});
      String query = (String) request.get("query");
      out.println(MAPPER.writeValueAsString(filter(data, query)));
    }
  }
}
