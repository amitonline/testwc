/**
 * Structure to hold user data obtained after login
 *
 */

function UserStruct(id, username, first_name, last_name, company_name, default_email_setting, has_teams, chrome_ext_auth) {
	this.id = id;
	this.username= username;
	this.first_name = first_name;
	this.last_name = last_name;
	this.company_name= company_name;
	this.default_email_setting =  default_email_setting;
	this.has_teams =  has_teams;
	this.chrome_ext_auth = chrome_ext_auth;
}
