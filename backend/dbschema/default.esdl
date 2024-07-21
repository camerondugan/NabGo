using extension auth;
module default {

}

type User {
	email: str;
	name: str;

	required identity: ext::auth::Identity {
		constraint exclusive;
	};
}
