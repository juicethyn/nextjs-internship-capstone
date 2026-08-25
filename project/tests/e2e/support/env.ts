function required(name: string): string {
	const value = process.env[name];

	if (!value) {
		throw new Error(
			`Missing ${name}. Add it to project/.env.local before running the E2E suite.`,
		);
	}

	return value;
}

export const e2eEnv = {
	get email() {
		return required("E2E_USER_EMAIL");
	},
	get password() {
		return required("E2E_USER_PASSWORD");
	},
	get verificationCode() {
		return required("E2E_VERIFICATION_CODE");
	},
};
