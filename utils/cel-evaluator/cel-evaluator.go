package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"time"

	"github.com/google/cel-go/cel"
	"github.com/google/cel-go/checker/decls"
	"github.com/google/cel-go/common/types"
	"github.com/google/cel-go/common/types/ref"
)

// Converts a CEL value to a regular Go interface{} for JSON serialization
func convertCELToInterface(celVal ref.Val) interface{} {
	switch celVal.Type() {
	case types.BoolType:
		return celVal.Value().(bool)
	case types.StringType:
		return celVal.Value().(string)
	case types.DoubleType:
		return celVal.Value().(float64)
	case types.IntType:
		return celVal.Value().(int64)
	case types.TimestampType:
		return celVal.Value().(time.Time).Format(time.RFC3339)
	case types.ListType:
		// Convert CEL list back to []interface{}
		listVal := celVal.Value().([]ref.Val)
		result := make([]interface{}, len(listVal))
		for i, elem := range listVal {
			result[i] = convertCELToInterface(elem)
		}
		return result
	default:
		// Fallback to the underlying value
		return celVal.Value()
	}
}

func main() {
	// Command-line arguments
	jsonString := flag.String("json", "{}", "JSON input data")
	typeMap := flag.String("types", "{}", "Property-to-datatype map (e.g., {\"key\":\"string\", \"timestamp\":\"timestamp\", \"items\":\"list\"})")
	query := flag.String("query", "", "CEL query string")

	flag.Parse()

	// Parse JSON data
	var data []map[string]interface{}
	if err := json.Unmarshal([]byte(*jsonString), &data); err != nil {
		log.Fatalf("Failed to parse JSON: %v", err)
	}

	// Parse type map
	var typeMapping map[string]string
	if err := json.Unmarshal([]byte(*typeMap), &typeMapping); err != nil {
		log.Fatalf("Failed to parse type map: %v", err)
	}

	// Convert JSON data to CEL-compatible types
	var convertedData []map[string]ref.Val
	for _, rawData := range data {
		convertedObject := make(map[string]ref.Val)
		for key, value := range rawData {
			expectedType, ok := typeMapping[key]
			if !ok {
				// Skip if the type is not specified
				continue
			}
			convertedObject[key] = convertToCELType(value, expectedType)
		}
		convertedData = append(convertedData, convertedObject)
	}

	// Create a CEL environment
	env, err := cel.NewEnv(
		cel.Declarations(decls.NewIdent("item", decls.NewMapType(decls.String, decls.Dyn), nil)),
	)
	if err != nil {
		log.Fatalf("Failed to create CEL environment: %v", err)
	}

	// Parse the CEL expression
	ast, issues := env.Parse(*query)
	if issues != nil && issues.Err() != nil {
		log.Fatalf("Failed to parse CEL query: %v", issues.Err())
	}

	// Check the CEL expression
	checked, issues := env.Check(ast)
	if issues != nil && issues.Err() != nil {
		log.Fatalf("Failed to check CEL query: %v", issues.Err())
	}

	// Program to evaluate the CEL expression
	prg, err := env.Program(checked)
	if err != nil {
		log.Fatalf("Failed to create CEL program: %v", err)
	}

	var results []map[string]ref.Val
	for i, item := range convertedData {
		out, _, err := prg.Eval(map[string]interface{}{"item": item})
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

	// Convert CEL values back to regular Go types for JSON output
	var jsonResults []map[string]interface{}
	for _, result := range results {
		jsonResult := make(map[string]interface{})
		for key, celVal := range result {
			jsonResult[key] = convertCELToInterface(celVal)
		}
		jsonResults = append(jsonResults, jsonResult)
	}

	// Output the results as JSON
	jsonOutput, err := json.MarshalIndent(jsonResults, "", "  ")
	if err != nil {
		log.Fatalf("Failed to marshal results: %v", err)
	}

	fmt.Println(string(jsonOutput))
}

// Converts a value to the appropriate CEL type based on the expected type.
func convertToCELType(value interface{}, expectedType string) ref.Val {
	switch expectedType {
	case "boolean":
		boolValue, ok := value.(bool)
		if !ok {
			log.Fatalf("Expected boolean but got: %v", value)
		}
		return types.Bool(boolValue)
	case "string":
		strValue, ok := value.(string)
		if !ok {
			log.Fatalf("Expected string but got: %v", value)
		}
		return types.String(strValue)
	case "number":
		numValue, ok := value.(float64) // JSON numbers are unmarshalled as float64
		if !ok {
			log.Fatalf("Expected number but got: %v", value)
		}
		return types.Double(numValue)
	case "date":
		strValue, ok := value.(string)
		if !ok {
			log.Fatalf("Expected date string but got: %v", value)
		}
		t, err := time.Parse(time.DateOnly, strValue)
		if err != nil {
			log.Fatalf("Invalid date format: %v", err)
		}
		return types.Timestamp{Time: t}
	case "timestamp":
		strValue, ok := value.(string)
		if !ok {
			log.Fatalf("Expected timestamp string but got: %v", value)
		}
		t, err := time.Parse(time.RFC3339, strValue)
		if err != nil {
			log.Fatalf("Invalid timestamp format: %v", err)
		}
		return types.Timestamp{Time: t}
	case "list":
		// TODO: Handle lists of objects
		listValue, ok := value.([]interface{})
		if !ok {
			log.Fatalf("Expected list/array but got: %v", value)
		}

		// Convert each element to a string CEL value
		celValues := make([]ref.Val, len(listValue))
		for i, elem := range listValue {
			strElem, ok := elem.(string)
			if !ok {
				log.Fatalf("Expected string element in list but got: %v", elem)
			}
			celValues[i] = types.String(strElem)
		}

		return types.NewDynamicList(types.DefaultTypeAdapter, celValues)
	default:
		log.Fatalf("Unsupported type: %v", expectedType)
	}
	return nil
}
