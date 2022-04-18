
import React from 'react';
import ReactDOM from 'react-dom';
import trashIcon from 'bootstrap-icons/icons/trash.svg';
import editIcon from 'bootstrap-icons/icons/pencil.svg';
import saveIcon from 'bootstrap-icons/icons/save.svg';
import checkIcon from 'bootstrap-icons/icons/check-lg.svg';
import cancelIcon from 'bootstrap-icons/icons/x-lg.svg';
import searchIcon from 'bootstrap-icons/icons/search.svg';
import './header.scss';

function setMessage(message) {
  const messageDiv = document.getElementById('message-div');
  messageDiv.innerHTML = message;
}

function DeleteIcon(props) {
  return <img src={trashIcon} onClick={props.onClick} title="Delete"></img>
}

function EditIcon(props) {
  return <img src={editIcon} onClick={props.onClick} title="Edit"></img>
}

function SaveIcon(props) {
  return <img src={saveIcon} onClick={props.onClick} title="Save"></img>
}

function SaveEditIcon(props) {
  return <img src={checkIcon} onClick={props.onClick} title="Save"></img>
}

function CancelIcon(props) {
  return <img src={cancelIcon} onClick={props.onClick} title="Cancel"></img>
}

function SearchIcon(props) {
  return <img src={searchIcon} onClick={props.onClick} title="Search"></img>
}

class TableRow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {edit: false};
  }

  startEdit() {
    this.setState({edit: true});
  }

  cancelEdit() {
    delete this.title;
    delete this.url;
    this.setState({edit: false});
  }

  saveEdit() {
    if (!this.title && !this.url) return;
    const save_title = this.title || this.props.title;
    const save_url = this.url || this.props.url;
    this.props.editBookmark(save_title, save_url, this.props.id);
    this.cancelEdit();
  }

  changeTitle(e) {
    this.title = e.target.value;
  }

  changeURL(e) {
    this.url = e.target.value;
  }

  render () {
    if (this.state.edit) return this.renderEditable();
    return (
      <div class="row mt-1">
        <div class="col">{this.props.title}</div>
        <div class="col"><a href={this.props.url}>{this.props.url}</a></div>
        <div class="col-auto">
          <DeleteIcon onClick={() => this.props.deleteBookmark(this.props.id)}/>
          <EditIcon onClick={() => this.startEdit()}/>
        </div>
      </div>
    );
  }

  renderEditable() {
    return (
      <div class="row mt-1">
        <div class="col">
          <input class="form-control-sm" type="text"
                 defaultValue={this.props.title}
                 onChange={(e) => this.changeTitle(e)}>
          </input>
        </div>
        <div class="col">
          <input class="form-control-sm" type="text"
                 defaultValue={this.props.url}
                 onChange={(e) => this.changeURL(e)}>
          </input>
        </div>
        <div class="col-auto">
          <CancelIcon onClick={() => this.cancelEdit()}/>
          <SaveEditIcon onClick={() => this.saveEdit()}/>
        </div>
      </div>
    );
  }
}

function ControlledInput(props) {
  return (
    <input class="form-control-sm"
           type='text'
           placeholder={props.placeholder}
           value={props.value}
           contentEditable='true'
           onChange={props.onChange}>
    </input>
  );
}

class TableRowInput extends React.Component {

  constructor(props) {
    super(props);
    this.state = {title: '', url: ''};
  }

  onChangeTitle(e) {
    this.setState({title: e.target.value});
  }

  onChangeURL(e) {
    this.setState({url: e.target.value});
  }

  startSearch() {
    this.props.searchBookmark(this.state.title, this.state.url);
  }

  saveBookmark() {
    this.props.saveBookmark(this.state.title, this.state.url);
    this.setState({title: '', url: ''});
  }

  render () {
    return (
      <div class="row">
        <div class="col">
          <ControlledInput placeholder='Title' value={this.state.title}
                           onChange={(e) => this.onChangeTitle(e)}/>
        </div>
        <div class="col">
          <ControlledInput placeholder='Link'  value={this.state.url}
                           onChange={(e) => this.onChangeURL(e)}/>
        </div>
        <div class="col-auto">
          <SearchIcon onClick={() => this.startSearch()}/>
          <SaveIcon onClick={() => this.saveBookmark()}/>
        </div>
      </div>
    );
  }
}

class Bookmarks extends React.Component {
  constructor(props) {
    super(props);
    this.state = {search_title: '', search_url: '', bookmarks: []};
  }

  searchBookmark(search_title, search_url) {
    this.setState({search_title, search_url});
  }

  componentDidMount() {
    this.fetchBookmarks();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.listId !== this.props.listId)
      this.fetchBookmarks();
  }

  fetchBookmarks() {
    fetch("/bookmarks/" + this.props.listId)
      .then(response => response.json())
      .then(bookmarks => this.setState({bookmarks}))
  }

  render() {
    const tableRows = [<TableRowInput title={this.state.search_title} url={this.state.search_url}
                                      searchBookmark={(t, u) => this.searchBookmark(t, u)}
                                      saveBookmark={(t, u) => this.saveBookmark(t, u, this.props.listId)}/>];
    const sorted_rows = this.state.bookmarks.slice();
    sorted_rows.sort((b1, b2) => b1.title.localeCompare(b2.title));
    for (let row of sorted_rows) {
      if (row.title.includes(this.state.search_title) &&
          row.url.includes(this.state.search_url)) {
        tableRows.push(<TableRow id={row.id} title={row.title} url={row.url}
                                 saveBookmark={(t, u) => this.saveBookmark(t, u)}
                                 editBookmark={(t, u, id) => this.editBookmark(t, u, id)}
                                 deleteBookmark={id => this.deleteBookmark(id)}/>);
      }
    }
    return tableRows;
  }

  saveBookmark(title, url, listId) {
    console.log("Save bookmark: title=" + title + ", url=" + url + ", listId=" + listId);
    if (!title || !url) return;
    const init = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({title, url, listId})
    };
    fetch('/savebookmark', init)
      .then(response => response.text())
      .then(message => {
        setMessage(message);
        this.fetchBookmarks();
      })
      .catch(err => console.log(err));
  }

  editBookmark(title, url, id) {
    console.log("Edit bookmark: id=" + id + ", title=" + title + ", url=" + url);
    if (!title || !url) return;
    const init = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({title, url, id})
    };
    fetch('/editbookmark', init)
      .then(response => response.text())
      .then(message => {
        setMessage(message);
        this.fetchBookmarks();
      })
      .catch((err) => console.log(err));
  }

  deleteBookmark(id) {
    console.log("Delete bookmark: id=" + id);
    const init = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({id})
    };
    fetch('/deletebookmark', init)
      .then(reponse => this.fetchBookmarks())
      .catch(err => console.log(err));
  }
}

function BookmarkLists(props) {
  const [name, setName] = React.useState('');
  const [searchName, setSearchName] = React.useState('');
  const [bookmarkLists, setBookmarkLists] = React.useState(null);

  function saveBookmarkList() {
    console.log("Save bookmark list: name=" + name);
    if (!name) return;
    const init = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({name})
    };
    fetch('/savebookmarklist', init)
      .then(response => response.text())
      .then(message => {
        setMessage(message);
        fetchBookmarkLists();
        setName('');
      })
      .catch(err => console.log(err));
  }

  React.useEffect(() => {
    if (!bookmarkLists) {
      fetchBookmarkLists();
    }
  });

  function fetchBookmarkLists() {
    fetch("/bookmarklists")
      .then(response => response.json())
      .then(lists => {
        let newListId = null;
        if (props.listId in lists.map(l => l.id)) {
          newListId = props.listId;
        } else if (lists.length > 0) {
          newListId = lists[0].id;
        }
        props.setBookmarkList(newListId);
        setBookmarkLists(lists)
      });
  }

  function deleteBookmarkList(listId) {
    console.log("Delete bookmark list: listId=" + listId);
    const init = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({listId})
    };
    fetch('/deletebookmarklist', init)
      .then(reponse => fetchBookmarkLists())
      .catch(err => console.log(err));
  }

  const inputs = [
    <div class="row">
      <div class="col">
        <ControlledInput placeholder='Link'  value={name}
                         onChange={(e) => setName(e.target.value)}/>
      </div>
      <div class="col-auto">
        <SearchIcon onClick={() => setSearchName(name)}/>
        <SaveIcon onClick={() => saveBookmarkList()}/>
      </div>
    </div>
  ];
  const filtered_bookmark_lists = (bookmarkLists || []).filter(row => row.name.includes(searchName));
  return inputs.concat(filtered_bookmark_lists.map(row =>
     <BookmarkList selectBookmarkList={() => props.setBookmarkList(row.id)}
                   deleteBookmarkList={() => deleteBookmarkList(row.id)}
                   fetchBookmarkLists={fetchBookmarkLists}
                   listId={row.id} listName={row.name}/>
  ));
}

function BookmarkList(props) {
  const [editable, setEditable] = React.useState(false);
  const [listName, setListName] = React.useState(props.listName);

  function changeListName(e) {
    setListName(e.target.value);
  }

  function saveEditedBookmarkList() {
    console.log("editedListName:" + listName);
    const init = {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({listId: props.listId, listName})
    };
    fetch("/editbookmarklist", init)
      .then(response => response.text())
      .then(message => {
        setMessage(message);
        props.fetchBookmarkLists();
        setEditable(false);
      });
  }

  if (!editable) {
    return (
      <div class="row mt-1">
        <div class="col bookmark-list-name" onClick={() => props.selectBookmarkList()}>{props.listName}</div>
        <div class="col-auto">
          <DeleteIcon onClick={props.deleteBookmarkList}/>
          <EditIcon onClick={() => setEditable(true)}/>
        </div>
      </div>
    );
  } else {
    return (
      <div class="row mt-1">
        <div class="col">
          <input class="form-control-sm" type="text"
                 defaultValue={props.listName} onChange={changeListName}>
          </input>
        </div>
        <div class="col-auto">
          <CancelIcon onClick={() => setEditable(false)}/>
          <SaveEditIcon onClick={saveEditedBookmarkList}/>
        </div>
      </div>
    );
  }
}

class BookmarkBrowser extends React.Component {
  constructor (props) {
    super(props);
    this.state = {listId: null};
  }

  setBookmarkList(listId) {
    console.log("Set bookmark list: " + listId);
    this.setState({listId});
  }

  render () {
    return (
      <div class="container mt-5">
        <div class="row">
          <div class="col">
            <h3>Save your bookmarks!</h3>
          </div>
          <div class="col-auto">
            <button class="btn-sm btn-outline-primary" onClick={() => {window.location = "/export"}}>
              Export
            </button>
            <button class="btn-sm btn-outline-primary" onClick={() => {window.location = "/logout"}}>
              Logout
            </button>
            <button class="btn-sm btn-outline-primary" onClick={() => {window.location = "/settings"}}>
              Settings
            </button>
          </div>
        </div>
        <div id="message-div"></div>
        <div class="row">
          <div class="col-4">
            <BookmarkLists listId={this.state.listId}
                           setBookmarkList={id => this.setBookmarkList(id)}/>
          </div>
          {this.state.listId &&
            <div class="col-8">
              <Bookmarks listId={this.state.listId}/>
            </div>
          }
        </div>
      </div>
    );
  }
}

function renderBookmarkBrowser() {
  const bookmarkBrowser = document.getElementById("bookmark-browser");
  ReactDOM.createRoot(bookmarkBrowser).render(<BookmarkBrowser/>);
}

renderBookmarkBrowser();
