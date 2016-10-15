const form = document.getElementById('search')

const querystring = {
  parse(str, sep = '&', eq = '=') {
    var result = {};
    str.split(sep).forEach(function (part) {
      var item = part.split(eq);
      result[item[0]] = decodeURIComponent(item[1]);
    });
    return result
  },

  stringify(obj, sep = '&', eq = '=') {
    return _.map(obj, (v, k) => k + eq + v).join(sep)
  }
}

let _params

function getParams() {
  if (!_params) {
    _params = querystring.parse(location.search.slice(1)) || {}
  }
  return _params;
}

if (form) {
  const search = form.querySelector('[type=search]')
  form.addEventListener('submit', function (e) {
    e.preventDefault()
    const params = getParams()
    if (search.value) {
      params.search = search.value.trim()
    }
    else {
      delete params.search
    }
    location.search = '?' + querystring.stringify(params)
    return false
  })
  form.style.display = 'block'
  search.focus()
}
