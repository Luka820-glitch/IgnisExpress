import { Box, Container, Typography } from "@mui/material";
import Navbar from "./Navbar";

const LandingPage: React.FC = () => {
  return (
    <Box sx={{ flexGrow: 1, minHeight: "100vh" }}>
      <Navbar />

      <Container maxWidth="md" sx={{ mt: 8, textAlign: "center" }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: "bold",
            mb: 3,
          }}
        >
          Welcome to InfernoExpress
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{
            lineHeight: 1.6,
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          The ultimate platform connecting users with reliable couriers. Fast,
          secure, and efficient delivery services at your fingertips.
        </Typography>

        <Box
          component="img"
          src="/logo.png"
          alt="InfernoExpress Logo"
          sx={{
            height: 400,
            width: "auto",
            mt: 4,
          }}
        />
      </Container>
    </Box>
  );
};
export default LandingPage;
