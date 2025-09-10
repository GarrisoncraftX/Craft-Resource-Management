package com.craftresourcemanagement.utils;

public class OpenAIClientException extends RuntimeException {

    public OpenAIClientException(String message) {
        super(message);
    }

    public OpenAIClientException(String message, Throwable cause) {
        super(message, cause);
    }
}

