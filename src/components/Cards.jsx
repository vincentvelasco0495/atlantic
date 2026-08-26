import { AccessTime, ArrowForward, EventOutlined } from '@mui/icons-material';
import { Box, Button, Card, CardContent, CardMedia, Stack, Typography } from '@mui/material';

export function RoomCard({ room, bookingHref = '#contacts' }) {
  return (
    <Card className="room-card">
      <Box className="card-image-wrap">
        <CardMedia component="img" image={room.image} alt={room.title} className="card-image" />
        <Typography className="room-price-badge">{room.price} <span>/ 1 night</span></Typography>
      </Box>
      <CardContent className="room-card-content">
        <Typography component="h3" className="card-title"><a href={bookingHref}>{room.title}</a></Typography>
        <Typography className="room-description">{room.description}</Typography>
        <Button href={bookingHref} className="card-action" endIcon={<ArrowForward />}>See availability</Button>
      </CardContent>
    </Card>
  );
}

export function NewsCard({ article }) {
  return (
    <Card className="news-card">
      <Box className="card-image-wrap news-image-wrap">
        <CardMedia component="img" image={article.image} alt="" className="card-image" />
        <span className="news-category">{article.category}</span>
      </Box>
      <CardContent className="news-card-content">
        <Typography component="h3" className="news-title"><a href="#news">{article.title}</a></Typography>
        <Typography className="news-description">{article.description}</Typography>
        <Stack direction="row" spacing={2} className="news-meta">
          <span><EventOutlined /> {article.date}</span>
          <span><AccessTime /> {article.readTime}</span>
        </Stack>
      </CardContent>
    </Card>
  );
}
