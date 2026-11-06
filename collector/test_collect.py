import unittest
from unittest.mock import Mock, patch

import requests

import collect


class FetchPricesTests(unittest.TestCase):
    @patch("collect.time.sleep")
    @patch("collect.requests.post")
    def test_retries_transient_request_error(self, post, sleep):
        response = Mock()
        response.json.return_value = {"results": []}
        post.side_effect = [requests.Timeout("temporary outage"), response]

        result = collect.fetch_prices({"lat": 1, "lng": 2, "fuel": 2, "radius": 5})

        self.assertEqual(result, {"results": []})
        self.assertEqual(post.call_count, 2)
        sleep.assert_called_once_with(10)

    @patch("collect.time.sleep")
    @patch("collect.requests.post", side_effect=requests.Timeout("still offline"))
    def test_raises_after_retry_limit(self, post, sleep):
        with self.assertRaises(requests.Timeout):
            collect.fetch_prices({"lat": 1, "lng": 2, "fuel": 2, "radius": 5})

        self.assertEqual(post.call_count, collect.FETCH_RETRIES)
        self.assertEqual(sleep.call_count, collect.FETCH_RETRIES - 1)


if __name__ == "__main__":
    unittest.main()
