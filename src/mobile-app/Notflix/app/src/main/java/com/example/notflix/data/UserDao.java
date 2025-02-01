package com.example.notflix.data;

import androidx.lifecycle.LiveData;
import androidx.room.Dao;
import androidx.room.Insert;
import androidx.room.OnConflictStrategy;
import androidx.room.Query;
import androidx.room.Update;

import com.example.notflix.data.model.User;

@Dao
public interface UserDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertUser(User user);

    @Query("SELECT * FROM Users WHERE token = :token")
    LiveData<User> getUserByToken(String token);

    @Query("SELECT * FROM Users WHERE token IS NOT NULL LIMIT 1")
    LiveData<User> getLoggedInUser();

    @Query("SELECT * FROM Users LIMIT 1")
    User getLoggedInUserSync(); // Synchronous method

    @Query("DELETE FROM Users WHERE username = :username")
    void deleteUser(String username);

    @Update()
    void updateUser(User user);
    @Query("DELETE FROM Users")
    void deleteAllUsers();
}