import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import './Navbar.css'

function Navbar({ username }) {
    const navigate = useNavigate()
    const [isDropdownVisible, setDropdownVisible] = useState(false)

    const handleHome = () => {
        navigate(`/${username}`)
    }

    const handleCreate = () => {
        navigate(`/${username}/create`)
    }

    const handleLogout = () => {
        try {
            fetch('http://localhost:3000/logout', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token: localStorage.getItem('refreshToken')
                })
            })

            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            navigate('/')
        } catch (error) {
            alert('Failed to logout')
        }
    }

    const handleMouseEnter = () => {
        setDropdownVisible(true);
    }

    const handleMouseLeave = () => {
        setDropdownVisible(false);
    }

    return (
        <div className='nav'>
            <button className='profileIcon'>Profile</button>
            <h1>RetroBeat</h1>
            <div
                className="menu"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <button className='dropdownButton'>Menu</button>
                {isDropdownVisible && (
                    <div className="dropdownMenu">
                        <ul>
                            <li onClick={handleHome}>Home</li>
                            <li onClick={handleCreate}>Create</li>
                            <li onClick={handleLogout}>Logout</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Navbar