import React, { useEffect, useState } from 'react';

const LoginLogsTable = () => {
    const [logs, setLogs] = useState([]);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchLogs = async () => {
            const response = await fetch('/api/login_logs', {
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token,
                },
            });
            const data = await response.json();
            setLogs(data);
        };

        fetchLogs();
    }, [token]);

    return (
        <div>
            <h2>Login Logs Table</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>User ID</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log) => (
                        <tr key={log.id}>
                            <td>{log.id}</td>
                            <td>{log.user_id}</td>
                            <td>{log.timestamp}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default LoginLogsTable;
