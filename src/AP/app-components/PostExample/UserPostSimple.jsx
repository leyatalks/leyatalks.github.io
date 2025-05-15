import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

function UserPostSimple(){
    return(
        <>
        <div className="quote-item">金句 1
            <span className="trash-icon">
                <FontAwesomeIcon icon={faTrash} />
            </span>
        </div>
        <div className="quote-item">金句 2
            <span className="trash-icon">
                <FontAwesomeIcon icon={faTrash} />
            </span>
        </div>
        <div className="quote-item">金句 3
            <span className="trash-icon">
                <FontAwesomeIcon icon={faTrash} />
            </span>
        </div>
        <div className="quote-item">金句 4
            <span className="trash-icon">
                <FontAwesomeIcon icon={faTrash} />
            </span>
        </div>
        </>
    )
}

export default UserPostSimple