package com.example.notflix.data;

import android.app.Application;
import android.util.Log;

import androidx.lifecycle.LiveData;

import com.example.notflix.data.model.LoggedInUser;
import com.example.notflix.data.model.UserEntity;

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
                    UserEntity userEntity = new UserEntity(
                            loggedInUser.getToken(),
                            loggedInUser.getUsername()
                    );
                    saveUser(userEntity);
                    Log.i("notATag", userEntity.getToken());
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
                    UserEntity userEntity = new UserEntity(
                            loggedInUser.getToken(),
                            loggedInUser.getUsername()
                    );
                    saveUser(userEntity);
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

//    public void logout(UserDataSource.LogoutCallback callback) {
//        new Thread(() -> {
//            try {
//                UserEntity user = userDao.getLoggedInUser().getValue();
//
//                if (user != null) {
//                    user.invalidateToken();
//                    userDao.updateUser(user);
//
//                    Result<Void> result = new Result.Success<>(null); // Indicate successful logout
//                    callback.onSuccess(result);
//
//                } else {
//                    // Handle the case where no logged-in user is found (maybe already logged out, or an error state).
//                    Result<Void> result = new Result.Error(new IOException("No user found to log out.")); // Or a more appropriate error.
//                    callback.onError(result);
//                }
//            } catch (Exception e) {
//                Result<Void> result = new Result.Error(e); // Handle any database or other errors
//                callback.onError(result);
//            }
//        }).start();
//    }


    public LiveData<UserEntity> getLoggedInUser() {
        return userDao.getLoggedInUser();
    }

    public void saveUser(UserEntity user) {
        AppDatabase.executor.execute(() -> userDao.insertUser(user));
    }

//    private void clearLocalUserData(UserDataSource.LogoutCallback callback) {
//        userDao.deleteUser();
//
//        callback.onSuccess();
//    }

    private void setLoggedInUser(LoggedInUser user) {
        this.user = user;
    }
}