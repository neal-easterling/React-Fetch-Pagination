const Pagination = ({ items, pageSize, onPageChange }) => {
  const { Button } = ReactBootstrap;
  if(items.length <=1) return null;
  let num = Math.ceil(items.length / pageSize);
  let pages = range(1, num +1);
  const list = pages.map(page=>{
    return (
      <Button key={page} onClick={onPageChange} className="page-item">{page}</Button>
    )
  });
  return (
    <nav>
      <ul className="pagination">{list}</ul>
    </nav>
  )
};

const range = (start, end) => {
  return Array(end - start + 1)
    .fill(0)
    .map((item, i) => start + i);
};

function paginate(items, pageNumber, pageSize) {
  const start = (pageNumber - 1) * pageSize;
  let page = items.slice(start, start + pageSize);
  return page;
}

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });

  useEffect(() => {
    let didCancel = false;
    const fetchData = async () => {
      dispatch({type: 'FETCH_INIT'});
      try{
        const result = await axios(url);
        if(!didCancel){
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch(error){
          if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      } 
    }
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};

const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case 'FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

// App that gets data from Hacker News url
function App() {
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState('expressionism');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    'https://api.artic.edu/api/v1/artworks/search?q=expressionism',
    {
      data: [],
    }
  );
  console.log(data);
  const handlePageChange = (e) => {
    setCurrentPage(Number(e.target.textContent));
  };

  let page = data.data;
  if (page.length >= 1) {
    page = paginate(page, currentPage, pageSize);
    console.log(`currentPage: ${currentPage}`);
  }
  return (
    <section className="container-md">
      <h1>Art Institute of Chicago Collection</h1>
      <form className="form-control form-control-lg"
        onSubmit={event => {
          doFetch(`https://api.artic.edu/api/v1/artworks/search?q=${query}`);
          event.preventDefault();
        }}
      >
        <div className="input-group input-group-md mb-3">
          <input
            className="form-control"
            type="text"
            value={query}
            onChange={event => setQuery(event.target.value)}
          />
          <button className="btn btn-primary" type="submit">Search</button>
        </div>
      </form>
      {isError && <div>Something went wrong ...</div>}
      {isLoading ? (
        <div>Loading ...</div>
      ) : (
        
        <ul className="list-group">
          {page.map((item) => (
            <li className="list-group-item" key={item.id}>
              <a href={'https://www.artic.edu/artworks/' + item.id}>{item.title}</a>
            </li>
          ))}
        </ul>
        
      )}
      <Pagination
        items={data.data}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      ></Pagination>
    </section>
  );
}

// ========================================
ReactDOM.render(<App />, document.getElementById('root'));
