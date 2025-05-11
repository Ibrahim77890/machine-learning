import React, { useState } from 'react';
import axios from 'axios';
import { 
  Container,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Paper,
  Box
} from '@mui/material';

function App() {
  const [userId, setUserId] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('api/recommend', {
        user_id: userId
      });
      setRecommendations(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Recommendation System
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="User ID"
            variant="outlined"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            margin="normal"
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Get Recommendations'}
          </Button>
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            Error: {error}
          </Typography>
        )}

        {recommendations.length > 0 && (
          <>
            <Typography variant="h6" gutterBottom>
              Top Recommendations
            </Typography>
            <List>
              {recommendations.map((rec, index) => (
                <ListItem key={index} divider>
                  <ListItemText
                    primary={`Item: ${rec.item_idx}`}
                    secondary={`Score: ${rec.score.toFixed(4)}`}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </Paper>
    </Container>
  );
}

export default App;