import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactDOM from 'react-dom';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';

function Chat() {
  const [ws, setWs] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [open, setopen] = useState(false);
  const { groupId } = useParams();

  const openModal = () =>{
    toggleOpen();
    setIsModalOpen(true);
  } 
  const closeModal = () => setIsModalOpen(false);
  const handleUpdateUsername = (newUsername) => setUsername(newUsername);
  const toggleOpen=() => setopen(!open);

  useEffect(() => {
    // Open websocket connection.
    const websocket = new WebSocket('wss://jdl0ze8ba1.execute-api.ap-northeast-1.amazonaws.com/test/');

    setWs(websocket);

    websocket.addEventListener("open", (event) => {
      if (websocket) {
        websocket.send(JSON.stringify({
          action: "on-enter-room",
          groupId: groupId ?? "dummy",
          username: username ?? "no_name",
        }));
      }
    });

    websocket.onmessage = (event) => {
      setMessages((prevMessages) => [...prevMessages, event.data]);
    };

    return () => {
      websocket.close();
    };
  }, []);

  useEffect(() => {
    if (ws) {
      ws.send(JSON.stringify({
        action: "on-enter-room",
        groupId: groupId ?? "dummy",
        username: username ?? "no_name",
      }));
    }
  }, [username]);

  const sendMessage = () => {
    if (ws) {
      ws.send(JSON.stringify({
        action: "on-message",
        message: input,
        groupId: groupId
      }));
      setInput('');
    }
  };

  const UpdateUsernameModal = ({ isOpen, onClose, onUpdate }) => {
    const [newUsername, setNewUsername] = useState('');

    useEffect(() => {
      // コンポーネントが表示された時にフォーカスを新しいユーザー名の入力フィールドに移動
      if (isOpen) {
        document.getElementById('usernameInput').focus();
      }
    }, [isOpen]);

    const handleUpdate = () => {
      // ユーザー名の更新処理
      onUpdate(newUsername);
      // モーダルを閉じる
      onClose();
    };

    return isOpen ? ReactDOM.createPortal(
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: isOpen ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{background: 'white', padding: '5vw', margin: '10vw'}}>
          <Typography variant="h6" component="div" sx={{ color: 'maroon', flexGrow: 1, display: 'flex', justifyContent: 'left', marginBottom: '5vw' }}>
          Update Username
          </Typography>
          <TextField id="usernameInput" label="Enter new username" variant="outlined" 
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', marginTop: "5vw" }}>
            <Button variant="contained" onClick={handleUpdate}
            style={{ flex: 1, background: 'burlywood' }}
            > Update </Button>
            <Button variant="outlined" onClick={onClose}
            style={{ flex: 1, marginLeft: '5vw', color: 'burlywood', borderColor: 'burlywood' }}
            > Cancel </Button>
          </div>
        </div>
      </div>,
      document.body
    ) : null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
      <AppBar position="static" style={{ flex: 1, display: 'flex', justifyContent: 'center', background: 'antiquewhite' }}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ color: 'maroon', mr: 2 }}
            onClick={toggleOpen}
          >
            <MenuIcon />
          </IconButton>
          <Drawer
            anchor='left'
            open={open}
            onClose={toggleOpen}
          >
            <Link href="#" underline="none" color="inherit" onClick={openModal} sx={{ margin: '3vw' }}>
              Update Username
            </Link>
            <Divider />
          </Drawer>
          <Typography variant="h6" component="div" sx={{ color: 'maroon', flexGrow: 1, display: 'flex', justifyContent: 'left', }}>
            Chat App
          </Typography>
          <UpdateUsernameModal
            isOpen={isModalOpen}
            onClose={closeModal}
            onUpdate={handleUpdateUsername}
          />
        </Toolbar>
      </AppBar>
      <div style={{ flex: 20, background: 'floralwhite'}}>
        <List sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: "1vh 5vw" }}>
          {messages.map((message, index) => (
            <ListItem key={index} alignItems="flex-start" sx={{background: 'white', marginBottom: '1vh'}}>
              <ListItemAvatar>
                <Avatar alt="Avater" src="sample.jpg" />
              </ListItemAvatar>
              <ListItemText
                primary={JSON.parse(message).username + (JSON.parse(message).isOwnMessage ? '(you)' : '')}
                secondary={JSON.parse(message).message}
              />
            </ListItem>
          ))}
        </List>
      </div>
      <div style={{ flex: 2, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', background: 'antiquewhite', padding: '3vw' }}>
        <TextField id="outlined-basic" label="Enter message" variant="outlined" 
          style={{ flex: 8, background: 'white' }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              sendMessage();
            }
          }}
          />
        <Button variant="contained" onClick={sendMessage}
          style={{ flex: 1, marginLeft: '5vw', background: 'burlywood' }}
        >
          send
        </Button>
      </div>
    </div>
  );
}

export default Chat;
