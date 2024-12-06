package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/google/cel-go/cel"
	"github.com/google/cel-go/checker/decls"
)

func main() {
	// Check if correct number of arguments are provided
	if len(os.Args) != 3 {
		log.Fatalf("Usage: %s '<JSON_ARRAY>' '<CEL_QUERY>'", os.Args[0])
	}

	jsonString := os.Args[1]
	celExpr := os.Args[2]

	// Parse JSON input
	var data []map[string]interface{}
	if err := json.Unmarshal([]byte(jsonString), &data); err != nil {
		log.Fatalf("Failed to parse JSON: %v", err)
	}

	// Create CEL environment
	env, err := cel.NewEnv(
		cel.Declarations(
			decls.NewVar("item", decls.NewMapType(decls.String, decls.Dyn)),
		),
	)
	if err != nil {
		log.Fatalf("Failed to create CEL environment: %v", err)
	}

	// Compile CEL expression
	ast, issues := env.Compile(celExpr)
	if issues != nil && issues.Err() != nil {
		log.Fatalf("Failed to compile CEL expression: %v", issues.Err())
	}

	// Create program
	prog, err := env.Program(ast)
	if err != nil {
		log.Fatalf("Failed to create CEL program: %v", err)
	}

	var results []map[string]interface{}
	// Evaluate each object in the data
	for i, item := range data {
		// Wrap object for CEL evaluation
		input := map[string]interface{}{
			"item": item,
		}
		out, _, err := prog.Eval(input)
		if err != nil {
			log.Printf("Evaluation failed for object %d: %v\n", i, err)
			continue
		}

		// Convert the result to a boolean
		boolVal, ok := out.Value().(bool)
		if !ok {
			log.Fatalf("CEL query must return a boolean")
		}

		// If the query returns true, add the item to results
		if boolVal {
			results = append(results, item)
		}
	}

	// Output the results as JSON
	jsonOutput, err := json.MarshalIndent(results, "", "  ")
	if err != nil {
		log.Fatalf("Failed to marshal results: %v", err)
	}

	fmt.Println(string(jsonOutput))
}
