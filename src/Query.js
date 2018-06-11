import React, { Component } from 'react';
import Autosuggest from 'react-autosuggest';
import handleSubmit from './controller';
import molecule from './molecule.svg';
import './App.css';

// Teach Autosuggest how to calculate suggestions for any given input value.
const getSuggestions = (value, records) => {
  const inputValue = value.trim().toUpperCase().replace(/[_{}]/g, '');
  const inputLength = inputValue.length;

  // Filter out any entries that don't match our formula.
  const suggestions = inputLength === 0 ? [] : records.filter(record =>
    (
      record.formula.toUpperCase().replace(/[_{}]/g, '').includes(inputValue)
    ) || (
      record.commonName.toUpperCase().includes(inputValue)
    )
  );

  // If we find no suggestions, then suggest we add a new one.
  if (suggestions.length === 0) {
    return [
      { isAddNew: true }
    ];
  }

  // We need to make sure our suggestions are still sorted.
  const sortedSuggestions = suggestions.sort((a, b) => a.referenceCount < b.referenceCount);

  return sortedSuggestions;
};

// This is how we determine what to populate the input field with when a suggestion is clicked.
const getSuggestionValue = (suggestion) => {
  // console.log(suggestion);
  return suggestion.formula
};

class Query extends Component {
  constructor(props) {
    super(props);
    this.state = localStorage.getItem(
      'state'
    ) ? JSON.parse(localStorage.getItem('state')) : {
        formula: '',
        formulas: [],
        records: [],
        suggestions: [],
        loading: false,
      };
  }

  // How we render our suggestions below the form.
  renderSuggestion = (suggestion) => {
    if (suggestion.isAddNew) {
      return (
        <span>
          [+] Search: <strong>{this.state.formula}</strong>
        </span>
      );
    }
    return (
      <span>
        {suggestion.formula} - {suggestion.commonName}
      </span>
    );
  }

  // If we select add new, return the current formula input.
  // Else, the value will be the formula for the molecule that was selected.
  getSuggestionValue = suggestion => {
    if (suggestion.isAddNew) {
      return this.state.formula;
    }

    return suggestion.formula;
  };

  // Called when new suggestions are requested.
  onSuggestionsFetchRequested = ({ value }) => {
    const suggestions = getSuggestions(value, this.state.records);
    this.setState({ suggestions });
  };

  // Called when suggestions are cleared.
  onSuggestionsClearRequested = () => {
    this.setState({ suggestions: [] });
  };

  // If we select add new, fetch new records from the ChemSpider API.
  // Else, fill the formula input with the selected suggestion.
  onSuggestionSelected = async (event, { suggestion }) => {
    if (suggestion.isAddNew) {
      // console.log('Add new:', this.state.formula);
      this.setState({ loading: true })
      const records = await handleSubmit(this.state.formula);
      const mergedRecords = this.state.records.concat(records);
      const mergedFormulas = this.state.formulas.concat([this.state.formula]);
      this.setState({ records: mergedRecords, formulas: mergedFormulas, loading: false });
      this.onSuggestionsFetchRequested({ value: this.state.formula })
    } else {
      this.setState({ formula: suggestion });
    }
  };

  // Called when input formula is changed.
  handleChange = (event, { newValue }) => {
    this.setState({ formula: newValue });
  };

  resetCollection = () => {
    this.setState({ records: [], suggestions: [], formulas: [], loading: false })
  }

  render() {
    const { formula, records, suggestions } = this.state;

    // Props for our input form in Autosuggest.
    const inputProps = {
      placeholder: 'Enter a formula',
      value: formula,
      onChange: this.handleChange,
    };

    // Lazy persisted state. Anytime our component is rendered, store current state to localstorage.
    const serializedState = JSON.stringify(this.state);
    localStorage.setItem('state', serializedState);

    return (
      <div className="Search-container">
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={this.getSuggestionValue}
          onSuggestionSelected={this.onSuggestionSelected}
          renderSuggestion={this.renderSuggestion}
          inputProps={inputProps}
        />

        {this.state.loading && <img src={molecule} className="App-logo" alt="loading" />}

        <br />

        <button onClick={this.resetCollection}>Reset</button>
      </div>
    );
  }
}

export default Query;