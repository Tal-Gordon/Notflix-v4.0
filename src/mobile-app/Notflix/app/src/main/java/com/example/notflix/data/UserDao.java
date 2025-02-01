package com.example.notflix.data;

import androidx.lifecycle.LiveData;
import androidx.room.Dao;
import androidx.room.Insert;
import androidx.room.OnConflictStrategy;
import androidx.room.Query;
import androidx.room.Update;

import com.example.notflix.data.model.UserEntity;

@Dao
public interface UserDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertUser(UserEntity user);

    @Query("SELECT * FROM users WHERE token = :token")
    LiveData<UserEntity> getUserByToken(String token);

    @Query("SELECT * FROM users WHERE token IS NOT NULL LIMIT 1")
    LiveData<UserEntity> getLoggedInUser();

    @Query("SELECT * FROM users LIMIT 1")
    UserEntity getLoggedInUserSync(); // Synchronous method

    @Query("DELETE FROM users WHERE username = :username")
    void deleteUser(String username);

    @Update()
    void updateUser(UserEntity user);
    @Query("DELETE FROM users")
    void deleteAllUsers();
}