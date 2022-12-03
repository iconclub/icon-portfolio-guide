import React from 'react'
import logo from './iconFinal.png'

export const Footer = () => {
    return (
        <footer style={{
            padding: "12px",
            paddingRight: "36px"
        }} >
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontWeight: "bold",
            }}>
                <img src={logo} alt="ICON Academic Club" width="120" height="70" /> 
                <span>Tên đội</span>
            </div>
        </footer>   
    );
}