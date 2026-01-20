const { expect } = require('chai');
const sinon = require('sinon');
const { KJUR } = require('jsrsasign');
const { jwsSign, jwsVerify } = require('../../src/signature/jws');

describe('jws', () => {
	let sandbox;

	const payload = { foo: 'bar' };
	const algo = 'PS256';
	const kid = 'test-kid';
	const privateKey = 'test-private-key';
	const publicKey = 'test-public-key';

	const encodeHeader = (header) => Buffer.from(JSON.stringify(header), 'utf-8').toString('base64url');
	const encodePayload = (data) => Buffer.from(JSON.stringify(data), 'utf-8').toString('base64url');

	beforeEach(() => {
		sandbox = sinon.createSandbox();
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe('jwsSign', () => {
		it('builds header with kid, alg and iat then strips payload', () => {
			const nowSeconds = 1_700_000_000;
			const intDateStub = sandbox.stub(KJUR.jws.IntDate, 'get').withArgs('now').returns(nowSeconds);
			const signStub = sandbox.stub(KJUR.jws.JWS, 'sign').callsFake((_algo, header, signPayload, key) => {
				expect(_algo).to.be.null;
				expect(header).to.deep.equal({ alg: algo, kid, crit: ['iat'], iat: nowSeconds.toString() });
				expect(signPayload).to.equal(payload);
				expect(key).to.equal(privateKey);
				return 'header.payload.signature';
			});

			const result = jwsSign(payload, kid, privateKey, algo);

			expect(result).to.equal('header..signature');
			expect(intDateStub.calledOnce).to.be.true;
			expect(signStub.calledOnce).to.be.true;
		});
	});

	describe('jwsVerify', () => {
		const baseHeader = { crit: ['iat'], iat: 1_700_000_000, alg: algo };
		const payloadB64 = encodePayload(payload);

		const buildJws = (headerOverrides = {}, signature = 'sig') => {
			const header = { ...baseHeader, ...headerOverrides };
			const headerB64 = encodeHeader(header);
			return { jws: `${headerB64}..${signature}`, header, headerB64 };
		};

		it('reconstructs the full JWS and verifies with allowed algorithm', () => {
			const clock = sandbox.useFakeTimers(new Date('2024-01-01T00:00:00Z'));
			const currentIat = Math.floor(clock.now / 1000);
			const { jws, headerB64 } = buildJws({ iat: currentIat });
			const verifyStub = sandbox.stub(KJUR.jws.JWS, 'verify').returns(true);

			const result = jwsVerify(jws, payload, publicKey, 60, [algo]);

			expect(result).to.be.true;
			expect(verifyStub.calledOnceWith(`${headerB64}.${payloadB64}.sig`, publicKey, [algo])).to.be.true;
		});

		it('throws when JWS is malformed', () => {
			expect(() => jwsVerify('onlytwo.parts', payload, publicKey, 60, [algo])).to.throw('Invalid JWS header');
		});

		it('throws when algorithm is not permitted', () => {
			const { jws } = buildJws({ alg: 'RS256' });

			expect(() => jwsVerify(jws, payload, publicKey, 60, [algo])).to.throw('Unsupported Signature verification algorithm');
		});

		it('throws when crit header is invalid', () => {
			const { jws } = buildJws({ crit: ['sub'] });

			expect(() => jwsVerify(jws, payload, publicKey, 60, [algo])).to.throw('Header crit of JWS Signature must contain only iat');
		});

		it('throws when iat is missing', () => {
			const { jws } = buildJws({ iat: undefined });

			expect(() => jwsVerify(jws, payload, publicKey, 60, [algo])).to.throw('Missing header iat in JWS signature');
		});

		it('throws when iat is not an integer', () => {
			const { jws } = buildJws({ iat: 'not-a-number' });

			expect(() => jwsVerify(jws, payload, publicKey, 60, [algo])).to.throw('Header iat of JWS Signature must be a valid timestamp');
		});

		it('throws when the signature is expired', () => {
			const clock = sandbox.useFakeTimers(new Date('2024-01-01T00:00:00Z'));
			const staleIat = Math.floor(clock.now / 1000) - 120;
			const { jws } = buildJws({ iat: staleIat });

			expect(() => jwsVerify(jws, payload, publicKey, 60, [algo])).to.throw('The signature has expired');
		});
	});
});
