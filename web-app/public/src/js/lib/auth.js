const AUTH_CODE_KEY = 'auth_code';
export default {
  isLoggedIn: function() {
    return !!this.getAuthCode();
  },
  getAuthCode: function(){
    return window.localStorage.getItem(AUTH_CODE_KEY);
  }
}
