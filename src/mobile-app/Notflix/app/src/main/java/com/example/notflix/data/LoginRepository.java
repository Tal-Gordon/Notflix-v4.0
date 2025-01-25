package com.example.notflix.data;

import android.app.Application;

import com.example.notflix.data.model.LoggedInUser;
import com.example.notflix.data.model.UserEntity;

/**
 * The {@code LoginRepository} class acts as the single source of truth for handling user authentication
 * and session management. It serves as a bridge between the {@link LoginDataSource}, which communicates
 * with the remote server, and the local database via {@link UserDao} to store user data.
 *
 * <p>This class provides the following functionalities:
 * <ul>
 *     <li>Handles login operations and processes server responses.</li>
 *     <li>Saves logged-in user information to the local Room database.</li>
 *     <li>Manages the user's logged-in state.</li>
 *     <li>Handles logout operations.</li>
 * </ul>
 */
public class LoginRepository {
    private LoginDataSource dataSource;
    private UserDao userDao;
    private LoggedInUser user = null;


    public LoginRepository(Application application) {
        dataSource = new LoginDataSource();
        userDao = AppDatabase.getInstance(application).userDao();
    }
    public void login(String username, String password, LoginDataSource.LoginCallback callback) {
        dataSource.login(username, password, new LoginDataSource.LoginCallback() {
            @Override
            public void onSuccess(Result<LoggedInUser> result) {
                // Save the user to Room
                if (result instanceof Result.Success) {
                    LoggedInUser loggedInUser = ((Result.Success<LoggedInUser>) result).getData();
                    UserEntity userEntity = new UserEntity(
                            loggedInUser.getUserId(),
                            loggedInUser.getDisplayName()
                    );
                    AppDatabase.executor.execute(() -> userDao.insertUser(userEntity));
                }
                callback.onSuccess(result);
            }

            @Override
            public void onError(Result<LoggedInUser> result) {
                callback.onError(result);
            }
        });
    }

    public boolean isLoggedIn() {
        return user != null;
    }

    public void logout() {
        user = null;
        dataSource.logout();
    }

    private void setLoggedInUser(LoggedInUser user) {
        this.user = user;
        // If user credentials will be cached in local storage, it is recommended it be encrypted
        // @see https://developer.android.com/training/articles/keystore
    }
}