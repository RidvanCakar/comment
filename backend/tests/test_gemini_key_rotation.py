import os
import pytest
from unittest.mock import MagicMock, patch
from gemini_service import (
    get_gemini_api_keys,
    has_valid_gemini_api_key,
    get_ordered_api_keys,
    rotate_to_next_key,
    mask_api_key,
    _generate_with_retry_sync,
    analyze_comments,
)


def test_mask_api_key():
    assert mask_api_key("") == "***"
    assert mask_api_key("short") == "***"
    assert mask_api_key("AIzaSyD_SampleKey12345") == "AIza...2345"


def test_get_gemini_api_keys_from_env():
    env_mock = {
        "GEMINI_API_KEY_1": "key_one_valid_123",
        "GEMINI_API_KEY_2": "your_key_2_here",  # placeholder, should be ignored
        "GEMINI_API_KEY_3": "key_three_valid_789",
        "GEMINI_API_KEYS": "key_four_list, key_five_list",
        "GEMINI_API_KEY": "key_legacy_single",
    }
    with patch.dict(os.environ, env_mock, clear=True):
        keys = get_gemini_api_keys()
        assert "key_one_valid_123" in keys
        assert "your_key_2_here" not in keys
        assert "key_three_valid_789" in keys
        assert "key_four_list" in keys
        assert "key_five_list" in keys
        assert "key_legacy_single" in keys
        assert len(keys) == 5
        assert has_valid_gemini_api_key() is True


def test_has_valid_gemini_api_key_empty():
    env_mock = {
        "GEMINI_API_KEY_1": "your_key_1_here",
        "GEMINI_API_KEY": "",
    }
    with patch.dict(os.environ, env_mock, clear=True):
        assert has_valid_gemini_api_key() is False
        assert get_gemini_api_keys() == []


def test_get_ordered_api_keys_with_preferred():
    env_mock = {
        "GEMINI_API_KEY_1": "key_alpha",
        "GEMINI_API_KEY_2": "key_beta",
        "GEMINI_API_KEY_3": "key_gamma",
    }
    with patch.dict(os.environ, env_mock, clear=True):
        ordered = get_ordered_api_keys(preferred_key="key_beta")
        assert ordered[0] == "key_beta"
        assert len(ordered) == 3


def test_rotation_on_quota_exceeded():
    env_mock = {
        "GEMINI_API_KEY_1": "key_quota_exhausted",
        "GEMINI_API_KEY_2": "key_working_fine",
    }

    call_configs = []

    def fake_configure(api_key):
        call_configs.append(api_key)

    mock_model_1 = MagicMock()
    mock_model_1.generate_content.side_effect = Exception("429 ResourceExhausted: Quota exceeded")

    mock_model_2 = MagicMock()
    mock_resp = MagicMock()
    mock_resp.text = '{"sentiment_distribution":{"positive_percent":80,"negative_percent":10,"neutral_percent":10},"topics":[],"overall_summary":"Harika video","top_recommendation":{"insight":"","action":"","expected_impact":""}}'
    mock_model_2.generate_content.return_value = mock_resp

    with patch.dict(os.environ, env_mock, clear=True):
        with patch("google.generativeai.configure", side_effect=fake_configure):
            with patch("google.generativeai.GenerativeModel") as mock_gen_model:
                mock_gen_model.side_effect = [
                    mock_model_1,  # Key 1 - Model 1 (429)
                    mock_model_1,  # Key 1 - Model 2 (429)
                    mock_model_1,  # Key 1 - Model 3 (429)
                    mock_model_2,  # Key 2 - Model 1 (Success!)
                ]

                result = analyze_comments(comments=["Çok güzel video", "Harika anlatım"])
                assert result["overall_summary"] == "Harika video"
                assert "key_quota_exhausted" in call_configs
                assert "key_working_fine" in call_configs
