import sqlite3 from 'sqlite3';
import { Chat, Message, AdminIntervention } from '@/types';

const dbPath = process.env.DATABASE_PATH || './database.sqlite';

// Initialize database connection
export const db = new sqlite3.Database(dbPath);

// Initialize database tables
export const initializeDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create chats table
      db.run(`
        CREATE TABLE IF NOT EXISTS chats (
          id TEXT PRIMARY KEY,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          status TEXT DEFAULT 'active',
          escalated_to_human BOOLEAN DEFAULT FALSE,
          follow_up_requested BOOLEAN DEFAULT FALSE,
          student_name TEXT,
          student_email TEXT
        )
      `, (err) => {
        if (err) {
          console.error('Error creating chats table:', err);
          reject(err);
          return;
        }
      });

      // Create messages table
      db.run(`
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          chat_id TEXT,
          content TEXT NOT NULL,
          sender TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          message_type TEXT DEFAULT 'text',
          FOREIGN KEY (chat_id) REFERENCES chats (id)
        )
      `, (err) => {
        if (err) {
          console.error('Error creating messages table:', err);
          reject(err);
          return;
        }
      });

      // Create admin_interventions table
      db.run(`
        CREATE TABLE IF NOT EXISTS admin_interventions (
          id TEXT PRIMARY KEY,
          chat_id TEXT,
          admin_message TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (chat_id) REFERENCES chats (id)
        )
      `, (err) => {
        if (err) {
          console.error('Error creating admin_interventions table:', err);
          reject(err);
          return;
        }
        resolve();
      });
    });
  });
};

// Chat operations
export const createChat = (chatId: string, studentName?: string, studentEmail?: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO chats (id, student_name, student_email) VALUES (?, ?, ?)',
      [chatId, studentName, studentEmail],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
};

export const getChatById = (chatId: string): Promise<Chat | undefined> => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM chats WHERE id = ?', [chatId], (err, row) => {
      if (err) reject(err);
      else resolve(row as Chat | undefined);
    });
  });
};

export const getAllChats = (): Promise<Chat[]> => {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT c.*, 
             COUNT(m.id) as message_count,
             MAX(m.timestamp) as last_message_time
      FROM chats c
      LEFT JOIN messages m ON c.id = m.chat_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `, (err, rows) => {
      if (err) reject(err);
      else resolve((rows || []) as Chat[]);
    });
  });
};

export const updateChatStatus = (chatId: string, status: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run('UPDATE chats SET status = ? WHERE id = ?', [status, chatId], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

export const escalateToHuman = (chatId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run('UPDATE chats SET escalated_to_human = TRUE WHERE id = ?', [chatId], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

export const requestFollowUp = (chatId: string, studentName: string, studentEmail: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE chats SET follow_up_requested = TRUE, student_name = ?, student_email = ? WHERE id = ?',
      [studentName, studentEmail, chatId],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
};

// Message operations
export const addMessage = (messageId: string, chatId: string, content: string, sender: string, messageType: string = 'text'): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO messages (id, chat_id, content, sender, message_type) VALUES (?, ?, ?, ?, ?)',
      [messageId, chatId, content, sender, messageType],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
};

export const getMessagesByChat = (chatId: string): Promise<Message[]> => {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM messages WHERE chat_id = ? ORDER BY timestamp ASC',
      [chatId],
      (err, rows) => {
        if (err) reject(err);
        else resolve((rows || []) as Message[]);
      }
    );
  });
};

// Admin intervention operations
export const addAdminIntervention = (interventionId: string, chatId: string, adminMessage: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO admin_interventions (id, chat_id, admin_message) VALUES (?, ?, ?)',
      [interventionId, chatId, adminMessage],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
};

export const getAdminInterventions = (chatId: string): Promise<AdminIntervention[]> => {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM admin_interventions WHERE chat_id = ? ORDER BY timestamp ASC',
      [chatId],
      (err, rows) => {
        if (err) reject(err);
        else resolve((rows || []) as AdminIntervention[]);
      }
    );
  });
};
