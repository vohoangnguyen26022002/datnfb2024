import React, { useEffect, useState } from 'react';
import './csspage/Userlist.css'
import { useDispatch, useSelector } from 'react-redux';
import { deleteUser, fetchAllUsers, getAllUser, updateUserStatus } from '../../../../redux/apiRequest';
import { createAxios } from '../../../../createInstance';

const UserList = () => {
    const user = useSelector((state) => state.auth.login?.currentUser);
    const usersList = useSelector((state) => state.users.users?.allUsers);
    const dispatch = useDispatch();

    useEffect(() => {
        if (user?.token) {
            fetchAllUsers(dispatch, user?.token); // Call the fetch function with token
        }
    }, [dispatch, user]);
    

    const handleToggle = (userId, field) => {
        // Handle toggle switch change for can_open or admin
        // Create a payload and dispatch an action to update the user
        const updatedUser = {
            [field]: !user.find(user => user.id === userId)[field],
        };
        // Call an updateUser action here if you have one
        // updateUser(dispatch, userId, updatedUser, accessToken);
    };


    return (
        <div className="user-table-container">
            <h2>User List</h2>
            <table className="user-table">
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Can Open</th>
                        <th>Admin</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                {usersList && usersList.length > 0 ? (
                        usersList.map((user) => (
                            <tr key={user.uid}>
                                <td>{user.userName}</td> 
                                <td>
                                    <label className="switch">
                                        <input 
                                            type="checkbox" 
                                            checked={user.can_open} 
                                            onChange={() => handleToggle(user.uid, 'can_open')}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </td>
                                <td>
                                    <label className="switch">
                                        <input 
                                            type="checkbox" 
                                            checked={user.admin} 
                                            onChange={() => handleToggle(user.uid, 'admin')}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </td>
                                <td>
                                    <button 
                                        className="delete-button" 
                                       
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4">No users found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default UserList;