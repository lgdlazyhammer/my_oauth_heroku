var oauthsession = OAuthSession.prototype;

function OAuthSession(UUID, SESSION, EXPIRES){
	this.uuid = UUID;
	this.session = SESSION;
	this.expires = EXPIRES;
}

oauthsession.getUuid = function(){
	return this.uuid;
}

oauthsession.getSession = function(){
	return this.session;
}

oauthsession.getExpires = function(){
	return this.expires;
}

oauthsession.setUuid = function(UUID){
	this.uuid = UUID;
}

oauthsession.setSession = function(SESSION){
	this.session = SESSION;
}

oauthsession.setExpires = function(EXPIRES){
	this.expires = EXPIRES;
}


module.exports = OAuthSession;