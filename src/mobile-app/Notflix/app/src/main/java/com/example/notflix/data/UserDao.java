package com.example.notflix.data;

import androidx.lifecycle.LiveData;
import androidx.room.Dao;
import androidx.room.Insert;
import androidx.room.OnConflictStrategy;
import androidx.room.Query;

import com.example.notflix.data.model.UserEntity;

@Dao
public interface UserDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertUser(UserEntity user);

    @Query("SELECT * FROM users WHERE userId = :userId")
    LiveData<UserEntity> getUserById(String userId);

    @Query("DELETE FROM users")
    void deleteAllUsers();
}