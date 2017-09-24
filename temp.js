'use strict';

function handleSignup(event) {
  event.preventDefault();
  const state = event.data;
  const form = $(event.target);
  const username = form.find('[name=username]').val().trim();
  const password = form.find('[name=password]').val().trim();
  form.trigger('reset'); // clear form, in particular, the password field

  api.signup(username, password)
    .then(() => {
      console.log('Success', 'Registration Completed');
      return api.login(username, password);
    }).then(results => {
      console.log('Success', 'Login Successful');
      state.token = results.token;
      render.page(state);
    }).catch(err => {
      if (err.reason === 'ValidationError') {
        console.error(err.reason, err.message);
      } else {
        console.error(err);
      }
    });
}

function handleLogin(event) {
  event.preventDefault();
  const state = event.data;
  const form = $(event.target);
  const username = form.find('[name=username]').val().trim();
  const password = form.find('[name=password]').val().trim();

  api.login(username, password)
    .then(results => {
      console.log('Success', 'Login Successful');
      state.token = results.token;
      render.page(state);
    }).catch(err => {
      if (err.reason === 'ValidationError') {
        console.error(err.reason, err.message);
      } else {
        console.error(err);
      }
    });
}

function handleSwitchView(event) {
  event.preventDefault();
  const state = event.data;
  state.view = 123;
  render.page(state);
}

function handleSearch(event) {
  event.preventDefault();
  const state = event.data;
  const form = $(event.target);

  const query = {
    name: form.find('[name=name]').val();
  };

  state.query = query;
  api.search(query)
    .then(list => {
      state.listResults = list;
      render.page(state);
    }).catch(err => {
      console.error(err);
    });
}

function handleDetails(event) {
  event.preventDefault();
  const state = event.data;
  const form = $(event.target);

  const id = $(event.target).closest('li').attr('id');
  state.currId = id;
  api.details(id)
    .then(item => {
      state.currItem = item;
      render.page(state);
    }).catch(err => {
      state.error = err;
      render.error(state);
    });
}

function handleUpdate(event) {
  event.preventDefault();
  const state = event.data;
  const form = $(event.target);

  state.update = {
    name: form.find('[name=name]').val()
  }
  api.update(state.currId, state.update, state.token)
    .then(res => {
      if (res.ok) {
        console.log('Success', 'Document Updated');
      }
    }).catch(err => {
      console.error(err);
    });
}

function handleRemove(event) {
  event.preventDefault();
  const state = event.data;
  const form = $(event.target);
  const id = $(event.target).closest('li').attr('id');
  
  state.deleteId = id;
  api.remove(id)
    .then(() => {
      state.deleteId = null;
      return api.search(state.query);
    }).catch(err => {
      console.error(err);
    });
}