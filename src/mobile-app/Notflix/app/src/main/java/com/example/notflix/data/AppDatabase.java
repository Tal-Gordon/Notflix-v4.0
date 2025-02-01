// AppDatabase.java
package com.example.notflix.data;

import android.content.Context;

import androidx.room.Database;
import androidx.room.Room;
import androidx.room.RoomDatabase;
import androidx.room.TypeConverters;

import com.example.notflix.data.model.Category;
import com.example.notflix.data.model.Movie;
import com.example.notflix.data.model.User;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Database(entities = {
        User.class,
        Movie.class,
        Category.class
}, version = 3)
@TypeConverters(Converters.class)
public abstract class AppDatabase extends RoomDatabase {
    public static ExecutorService executor = Executors.newFixedThreadPool(4);
    // DAO declarations
    public abstract UserDao userDao();
    public abstract MovieDao movieDao();
    public abstract CategoryDao categoryDao();

    private static volatile AppDatabase INSTANCE;

    public static AppDatabase getInstance(Context context) {
        if (INSTANCE == null) {
            synchronized (AppDatabase.class) {
                if (INSTANCE == null) {
                    INSTANCE = Room.databaseBuilder(
                                    context.getApplicationContext(),
                                    AppDatabase.class,
                                    "notflix-db"
                            )
                            .fallbackToDestructiveMigration() // Temporary for development.  REMOVE IN PRODUCTION
                            .build();
                }
            }
        }
        return INSTANCE;
    }
}