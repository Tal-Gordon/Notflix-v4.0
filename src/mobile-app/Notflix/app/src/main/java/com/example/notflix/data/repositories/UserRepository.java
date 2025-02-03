package com.example.notflix.data.repositories;

import android.app.Application;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import androidx.lifecycle.LiveData;

import com.example.notflix.data.database.AppDatabase;
import com.example.notflix.data.database.Result;
import com.example.notflix.data.daos.UserDao;
import com.example.notflix.data.datasources.UserDataSource;
import com.example.notflix.data.model.processeddata.LoggedInUser;
import com.example.notflix.Entities.User;

import java.util.concurrent.ExecutionException;

/**
 * The {@code UserRepository} class acts as the single source of truth for handling user authentication
 * and session management. It serves as a bridge between the {@link UserDataSource}, which communicates
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
public class UserRepository {
    private UserDataSource dataSource;
    private UserDao userDao;
    private LoggedInUser user = null;


    public UserRepository(Application application) {
        dataSource = new UserDataSource();
        userDao = AppDatabase.getInstance(application).userDao();
    }
    public void login(String username, String password, UserDataSource.AuthCallback callback) {
        dataSource.login(username, password, new UserDataSource.AuthCallback() {
            @Override
            public void onSuccess(Result<LoggedInUser> result) {
                // Save the user to Room
                if (result instanceof Result.Success) {
                    LoggedInUser loggedInUser = ((Result.Success<LoggedInUser>) result).getData();
                    User user = new User(
                            loggedInUser.getToken(),
                            loggedInUser.getUsername()
                    );
                    saveUser(user);
                    setLoggedInUser(loggedInUser);
                }
                callback.onSuccess(result);
            }

            @Override
            public void onError(Result<LoggedInUser> result) {
                callback.onError(result);
            }
        });
    }

    public void signup(String username, String password, String name, String surname, UserDataSource.AuthCallback callback) {
        dataSource.signup(username, password, name, surname, new UserDataSource.AuthCallback() {
            @Override
            public void onSuccess(Result<LoggedInUser> result) {
                // Save the user to Room
                if (result instanceof Result.Success) {
                    LoggedInUser loggedInUser = ((Result.Success<LoggedInUser>) result).getData();
                    User user = new User(
                            loggedInUser.getToken(),
                            loggedInUser.getUsername()
                    );
                    saveUser(user);
                    setLoggedInUser(loggedInUser);
                    setLoggedInUser(loggedInUser);
                }
                callback.onSuccess(result);
            }

            @Override
            public void onError(Result<LoggedInUser> result) {
                callback.onError(result);
            }
        });
    }

    public void logout() {
        AppDatabase.executor.execute(() -> {
            try {
                userDao.fullLogout();
                new Handler(Looper.getMainLooper()).post(() -> {
                    setLoggedInUser(null);
                });
            } catch (Exception e) {
                Log.e("Logout", "Error during logout", e);
            }
        });
    }

    public LiveData<User> getLoggedInUser() {
        return userDao.getLoggedInUser();
    }

    public void saveUser(User user) {
        AppDatabase.executor.execute(() -> userDao.insertUser(user));
    }

    private void setLoggedInUser(LoggedInUser user) {
        this.user = user;
    }

    public String getToken() {
        try {
            return AppDatabase.executor.submit(() -> {
                User user = userDao.getLoggedInUserSync();
                return user != null ? user.getToken() : null;
            }).get();
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
            return null;
        }
    }

}