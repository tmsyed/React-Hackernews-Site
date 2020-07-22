import React from 'react';
import axios from 'axios';
import { sortBy } from 'lodash';
import styled from 'styled-components';
import { ReactComponent as Check } from './check.svg';

const StyledContainer = styled.div`
  height: 100vw;
  padding: 20px;

  background: #83a4d4; /* fallback for old browsers */
  background: linear-gradient(to left, #b6fbff, #83a4d4);
  color: #171212;
`;

const StyledHeadlinePrimary = styled.h1`
  font-size: 48px;
  font-weight: 300;
  letter-spacing: 2px;
`;

const StyledItem = styled.div`
  display: flex;
  align-items: center;
  padding-bottom: 5px;
`;

const StyledColumn = styled.span`
  padding: 0 5px;
  white-space: nowrap;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  a {
    color: inherit;
  }
  width: ${props => props.width};
`;

const StyledButton = styled.button`
  background: transparent;
  border: 1px solid #171212;
  padding: 5px;
  cursor: pointer;
  transition: all 0.1s ease-in;
  &:hover {
    background: #171212;
    color: #ffffff;
  }
  &:hover > svg > g {
    fill: #ffffff;
    stroke: #ffffff;
  }
`;

const StyledButtonSmall = styled(StyledButton)`
  padding: 5px;
`;

const StyledButtonLarge = styled(StyledButton)`
  padding: 10px;
`;

const StyledSearchForm = styled.form`
  padding: 10px 0 20px 0;
  display: flex;
  align-items: baseline;
`;

const StyledLabel = styled.label`
  border-top: 1px solid #171212;
  border-left: 1px solid #171212;
  padding-left: 5px;
  font-size: 24px;
`;
const StyledInput = styled.input`
  border: none;
  border-bottom: 1px solid #171212;
  background-color: transparent;
  font-size: 24px;
`;


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
  const isMounted = React.useRef(false);

  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  );

  React.useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      console.log('A');
      localStorage.setItem(key, value);
    }
  }, [value, key]);

  return [value, setValue];
};

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

const getSumComments = stories => {
  console.log('C');

  return stories.data.reduce(
    (result, value) => result + value.num_comments,
    0
  );
};

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

  const handleRemoveStory = React.useCallback(item => {
    dispatchStories({
      type: "REMOVE_STORY",
      payload: item,
    });
  }, []);

  console.log('B: App');

  const sumComments = React.useMemo(() => getSumComments(stories), [stories,]);

  return (
      <StyledContainer>
        <StyledHeadlinePrimary>My Hacker Stories with {sumComments} comments.</StyledHeadlinePrimary>

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

        <div>
          Icons made by <a href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a>
        </div>
      </StyledContainer>
  );
};

const SearchForm = ({ searchTerm, onSearchInput, onSearchSubmit, }) => (
  <StyledSearchForm onSubmit={onSearchSubmit}>
    <InputWithLabel id="search" value={searchTerm} isFocused onInputChange={onSearchInput}>
      <strong>Search:</strong>
    </InputWithLabel>

    <StyledButtonLarge
      type="submit"
      disabled={!searchTerm}>
        Submit
    </StyledButtonLarge>
  </StyledSearchForm>
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
        <StyledLabel htmlFor={id}>
          {children}
        </StyledLabel>
        &nbsp;
        <StyledInput 
          ref={inputRef} 
          id={id} 
          type={type} 
          value={value} 
          onChange={onInputChange}
        />
      </>
);
}

const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENT: list => sortBy(list, 'num_comments').reverse(),
  POINT: list => sortBy(list, 'points').reverse(),
}

const List = ({ list, onRemoveItem }) => {
  const [sort, setSort] = React.useState({
    sortKey: 'NONE',
    isReverse: false,
  });

  const handleSort = sortKey => {
    const isReverse = sort.sortKey === sortKey && !sort.isReverse;
    setSort({ sortKey: sortKey, isReverse: isReverse});
  };

  const sortFunction = SORTS[sort.sortKey];
  const sortedList = sort.isReverse
    ? sortFunction(list).reverse()
    : sortFunction(list);

  return (
    <div>
      <div style={{ display: 'flex' }}>
        <span style={{ width: '45%' }}>
          <StyledButton type="button" onClick={() => handleSort('TITLE')}>
            Title
          </StyledButton>
        </span>
        <span style={{ width: '30%' }}>
          <StyledButton type="button" onClick={() => handleSort('AUTHOR')}>
            Author
          </StyledButton>
        </span>
        <span style={{ width: '18%' }}>
          <StyledButton type="button" onClick={() => handleSort('COMMENT')}>
            Comments
          </StyledButton>
        </span>
        <span style={{ width: '10%' }}>
          <StyledButton type="button" onClick={() => handleSort('POINT')}>
            Points
          </StyledButton>
        </span>
        <span style={{ width: '10%' }}>Actions</span>
      </div>

      {sortedList.map(item => (
        <Item
        key={item.objectID}
        item={item}
        onRemoveItem={onRemoveItem}
        />
      ))}
    </div>
  );
};
  


const Item = ({ item, onRemoveItem }) => (
  <StyledItem>
    <StyledColumn width="45%">
      <a href={item.url}>{item.title}</a>
    </StyledColumn>
    <StyledColumn width="30%">{item.author}</StyledColumn>
    <StyledColumn width="15%">{item.num_comments}</StyledColumn>
    <StyledColumn width="10%">{item.points}</StyledColumn>
    <StyledColumn width="10%">
      <StyledButtonSmall
        type="button"
        onClick={() => onRemoveItem(item)}
      >
        <Check height="18px" width="18px" />
      </StyledButtonSmall>
    </StyledColumn>
  </StyledItem>
);
export default App;
export { SearchForm, InputWithLabel, List, Item};