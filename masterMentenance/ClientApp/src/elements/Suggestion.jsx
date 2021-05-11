import React, { useState } from 'react';
import Autosuggest from 'react-autosuggest';

const languages = [
  {
    name: 'C',
    year: 1972,
  },
  {
    name: 'C#',
    year: 2000,
  },
  {
    name: 'C++',
    year: 1983,
  },
  {
    name: 'Clojure',
    year: 2007,
  },
  {
    name: 'Elm',
    year: 2012,
  },
  {
    name: 'Go',
    year: 2009,
  },
  {
    name: 'Haskell',
    year: 1990,
  },
  {
    name: 'Java',
    year: 1995,
  },
  {
    name: 'Javascript',
    year: 1995,
  },
  {
    name: 'Perl',
    year: 1987,
  },
  {
    name: 'PHP',
    year: 1995,
  },
  {
    name: 'Python',
    year: 1991,
  },
  {
    name: 'Ruby',
    year: 1995,
  },
  {
    name: 'Scala',
    year: 2003,
  },
];

export const AutosuggestText = () => {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState(languages);

  const escapeRegexCharacters = (str) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const onSuggestionsFetchRequested = ({ value }) => {
    const escapedValue = escapeRegexCharacters(value.trim());
    if (escapedValue === '') {
      setSuggestions([]);
      return false;
    }
    const regex = new RegExp('^' + escapedValue, 'i');
    setSuggestions(languages.filter((language) => regex.test(language.name)));
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const getSuggestionValue = (suggestion) => {
    return suggestion.name + ' ' + suggestion.year;
  };

  const renderSuggestion = (suggestion) => {
    return <div>{suggestion.name + ' ' + suggestion.year}</div>;
  };

  const onChange = (e, { newValue }) => {
    setValue(newValue);
  };

  const inputProps = {
    placeholder: '社員番号または社員名',
    value,
    onChange,
  };

  return (
    <Autosuggest
      {...{
        suggestions,
        onSuggestionsFetchRequested,
        onSuggestionsClearRequested,
        getSuggestionValue,
        renderSuggestion,
        inputProps,
      }}
    />
  );
};
