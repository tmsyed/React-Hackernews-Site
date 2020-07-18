import React from 'react';
import axios from 'axios';
import cs from 'classnames';
import styles from './App.module.css';

const storiesReducer = (state, action) => {
  switch(action.type) {
    case "STORIES_FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "STORIES_FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "STORIES_FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      }
    case "REMOVE_STORY":
      return {
        ...state,
        data: state.data.filter(
          story => action.payload.objectID !== story.objectID
        ),
      };
    default:
      throw new Error();
  }
};


const useSemiPersistentState = (key, initialState) => {
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  );

  React.useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key]);

  return [value, setValue];
};

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

const App = () => {
  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React');

  const [url, setUrl] = React.useState(
    `${API_ENDPOINT}${searchTerm}`
  );

  const [stories, dispatchStories] = React.useReducer(
    storiesReducer,
    { data: [], isLoading: false, isError: false }
  );

  const handleFetchStories = React.useCallback(async () => {
    dispatchStories({ type: "STORIES_FETCH_INIT" });

    try {
      const result = await axios.get(url);

      dispatchStories({
        type: "STORIES_FETCH_SUCCESS",
        payload: result.data.hits,
    });
    } catch {
      dispatchStories({ type: "STORIES_FETCH_FAILURE" });
    }
  }, [url]);

  React.useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);

  const handleSearchInput = event => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = event => {
    setUrl(`${API_ENDPOINT}${searchTerm}`);

    event.preventDefault();
  };

  const handleRemoveStory = item => {
    dispatchStories({
      type: "REMOVE_STORY",
      payload: item,
    });
  };

  return (
      <div className={styles.container}>
        <h1 className={styles.headlinePrimary}>My Hacker Stories</h1>

        <SearchForm
          searchTerm={searchTerm}
          onSearchInput={handleSearchInput}
          onSearchSubmit={handleSearchSubmit}
        />

        {stories.isError && <p>Something went wrong...</p>}

        {stories.isLoading ? (
          <p>Loading...</p>
        ): (
          <List list={stories.data} onRemoveItem={handleRemoveStory} />
        )}
        
        {/*list.map((item) => <div key={item.objectID}>{item.title}</div>)*/}
      </div>
  );
};

const SearchForm = ({ searchTerm, onSearchInput, onSearchSubmit, }) => (
  <form onSubmit={onSearchSubmit} className={styles.SearchForm}>
    <InputWithLabel id="search" value={searchTerm} isFocused onInputChange={onSearchInput}>
      <strong>Search:</strong>
    </InputWithLabel>

    <button
      type="submit"
      disabled={!searchTerm}
      className={cs(styles.button, styles.buttonLarge)}>
        Submit
    </button>
  </form>
);

const InputWithLabel = ({ id, type="text", value, isFocused, onInputChange, children }) => {
  const inputRef = React.useRef();

  React.useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  return (
      <>
        <label htmlFor={id} className={styles.label}>
          {children}
        </label>
        &nbsp;
        <input 
          ref={inputRef} 
          id={id} 
          type={type} 
          value={value} 
          onChange={onInputChange} 
          className={styles.input}
        />
      </>
);
}


const List = ({ list, onRemoveItem }) =>
  list.map(item => 
    <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
  );


const Item = ({ item, onRemoveItem }) => (
  <div className={styles.item}>
    <span style={{ width: '40%' }}>
      <a href={item.url}>{item.title}</a>
    </span>
    <span style={{ width: '30%' }}>{item.author}</span>
    <span style={{ width: '10%' }}>{item.num_comments}</span>
    <span style={{ width: '10%' }}>{item.points}</span>
    <span style={{ width: '10%' }}>
      <button type="button" className={`${styles.button} ${styles.buttonSmall}`} onClick={() => onRemoveItem(item)}>
        Dismiss
      </button>
    </span>
  </div>
);
export default App;