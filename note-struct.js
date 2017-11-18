/**
 * Structure to hold note data to send to server
 *
 */

function DataStruct (note, team_ids) {
	this.note = note;
	this.team_ids = team_ids;
}

function NoteStruct(title, tags, body, note_type_id,investment_events, inherent_percent_change, key, 
		visibility, distribution_emails, tag_list) {

	this.title = title;
	this.tags = tags;
	this.body = body;
	this.note_type_id = note_type_id;
	this.investment_events = investment_events;
	this.inherent_percent_change = inherent_percent_change;
	this.key = key;
	this.visibility = visibility;
	this.distribution_emails = distribution_emails;
	this.tag_list = tag_list;
}

