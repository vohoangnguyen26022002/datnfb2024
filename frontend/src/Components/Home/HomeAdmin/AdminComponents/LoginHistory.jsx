import React, { useEffect, useState } from 'react';
// import './AdminDashboard.css'
import { useDispatch, useSelector } from 'react-redux';
import { getPassWordHistory } from '../../../../redux/apiRequest';
import moment from 'moment';

const LoginHistory = () => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const PassWordList = useSelector((state) => state.users.passWordHistories?.allPassWord);
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;


  useEffect(() => {
    if(user?.accessToken) {
      getPassWordHistory(user?.accessToken, dispatch);
    }
  },[user, dispatch]);

 // Hàm phân trang
 const paginate = (data) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  return data.slice(startIndex, startIndex + itemsPerPage);
};


// Sắp xếp danh sách theo unlockTime (mới nhất trước)
const sortedPassWordList = Array.isArray(PassWordList)
? [...PassWordList].sort((a, b) => new Date(b.unlockTime) - new Date(a.unlockTime))
: [];

  // GỌI hàm phân trang
  const paginatedEntries = paginate(sortedPassWordList);

  // Tính tổng số trang
  const totalPages = Math.ceil(sortedPassWordList.length / itemsPerPage);
  

  return (
    <div className="login-history">
    <h2>Login History PassWord</h2>
    <table className="login-history-table">
      <thead>
        <tr>
          <th>Email</th>
          <th>Thời gian mở cửa</th>
        </tr>
      </thead>
      <tbody>
      {paginatedEntries.length > 0 ? (
            paginatedEntries.map((entry, index) => (
              <tr key={index}> 
                <td>{entry.email || undefined }</td>
                <td>{moment(entry.unlockTime).format('YYYY-MM-DD HH:mm:ss')}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2">No login history available.</td>
            </tr>
          )}
        </tbody>
      </table>
      
      <div className="pagination">
        <button 
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button 
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default LoginHistory;


