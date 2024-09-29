import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import styles from './index.module.css';

const ParticipantList = ({ participants, username }) => {
    const [isOpen, setIsOpen] = useState(false);

    const togglePopup = () => {
        setIsOpen(!isOpen);
    };

    const truncateUsername= (username) => {
        if (username.length > 10) {
            return username.slice(0, 7) + '...';
        }
        return username;
    };

    return (
        <div className={styles.participantWrapper}>
            <Plus
                onClick={togglePopup}
                className={`${styles.participantIcon} ${isOpen ? styles.rotateIcon : ''}`}
            />

            {isOpen && (
                <div className={`${styles.participantPopup} ${isOpen ? styles.show : ''}`}>
                    <h3 className={styles.participantheading}>Participants</h3>
                    <hr ></hr>
                    <ul>
                        {participants.map((participant) => (
                            <li key={participant.id}>
                                <span>{truncateUsername(participant.username)}</span>
                                <span style={{ marginLeft: 'auto' }}>
                                    {participant.username === username ? "You" : ""}
                                </span>
                            </li>
                        ))}

                    </ul>
                </div>
            )}
        </div>
    );
};

export default ParticipantList;
