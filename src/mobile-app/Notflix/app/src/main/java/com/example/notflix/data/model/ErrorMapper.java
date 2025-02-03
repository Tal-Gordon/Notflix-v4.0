package com.example.notflix.data.model;

import com.example.notflix.R;

/**
 * A class that maps errors received from the backend to string resources, for internal use
 */
public class ErrorMapper {
    public static int getErrorResource(String errorMessage) {
        if (errorMessage == null) {
            return R.string.error_unknown;
        }

        switch (errorMessage.toLowerCase()) {
            case "username and password are required":
                return R.string.error_username_password_empty;
            case "user not found or incorrect credentials":
                return R.string.error_incorrect_credentials;
            default:
                if (errorMessage.toLowerCase().startsWith("error logging in: failed to connect")) {
                    return R.string.error_connection_refused;
                }
                return R.string.error_unknown;
        }
    }
}