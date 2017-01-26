var quota = require('quota');
var manager = new quota.Manager({
	backoff: 'timeout'
});

// 10 new requests per second

manager.addRule({
	name: 'main',
	limit: 8,
	window: 10000,
	throttling: 'window-sliding',
	queueing: 'fifo',
	resource: 'requests'
});

var quotaServer = new quota.Server();
quotaServer.addManager('custom', manager);

var quotaClient = new quota.Client(quotaServer);
var request = require('request-promise');

var throttle = function(options) {

	var _grant;

	return quotaClient.requestQuota('custom', {}, { requests: 1 }, {
		maxWait: 60000 // Each request will be queued for 60 seconds and discarded if it didn't get a slot to be executed until then
	})
	.then(function (grant) {

		_grant = grant;

		return request(options);

	})
	.finally(function () {

		if (_grant) {
			_grant.dismiss();
		}

	});

}
module.exports = throttle;
