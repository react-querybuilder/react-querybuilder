<script lang="ts">
  import { QueryBuilder } from '../index';
  import type { RuleGroupType, Field } from '@react-querybuilder/core';
  import '@react-querybuilder/core/dist/query-builder.css';

  const fields: Field[] = [
    { name: 'firstName', label: 'First Name' },
    { name: 'lastName', label: 'Last Name' },
    { name: 'age', label: 'Age', inputType: 'number' },
    { name: 'gender', label: 'Gender', values: [
      { name: 'M', label: 'Male' },
      { name: 'F', label: 'Female' },
      { name: 'O', label: 'Other' }
    ]},
    { name: 'height', label: 'Height', inputType: 'number' },
    { name: 'job', label: 'Job' },
    { name: 'isActive', label: 'Active', inputType: 'checkbox', valueEditorType: 'checkbox' },
    { name: 'birthdate', label: 'Birth Date', inputType: 'date' },
  ];

  let query = $state<RuleGroupType>({
    combinator: 'and',
    rules: [
      { id: '1', field: 'firstName', operator: '=', value: 'Steve' },
      { id: '2', field: 'age', operator: '>', value: 28 }
    ]
  });

  function handleQueryChange(newQuery: RuleGroupType) {
    // console.log('Query changed:', JSON.stringify(newQuery, null, 2));
  }
</script>

<svelte:head>
  <title>Svelte Query Builder Example</title>
</svelte:head>

<div class="container">
  <h1>Svelte Query Builder</h1>
  <p>Built with Svelte 5 runes</p>

  <div class="query-builder-wrapper">
    <QueryBuilder
      {fields}
      bind:query
      onQueryChange={handleQueryChange}
      showNotToggle
      showCombinatorsBetweenRules={false}
      showCloneButtons
      showLockButtons
      showShiftActions
    />
  </div>

  <div class="output">
    <h2>Query Output</h2>
    <pre>{JSON.stringify(query, null, 2)}</pre>
  </div>
</div>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  h1 {
    color: #ff3e00;
    margin-bottom: 0.5rem;
  }

  p {
    color: #666;
    margin-bottom: 2rem;
  }

  .query-builder-wrapper {
    margin-bottom: 2rem;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: #f9f9f9;
  }

  .output {
    padding: 1rem;
    background: #f4f4f4;
    border-radius: 4px;
  }

  .output h2 {
    margin-top: 0;
    font-size: 1.2rem;
  }

  pre {
    background: #fff;
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
    border: 1px solid #ddd;
  }
</style>
