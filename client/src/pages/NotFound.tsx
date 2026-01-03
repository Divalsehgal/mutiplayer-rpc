import { Box, Heading, Text, Button, Stack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Box
      w="480px"
      mx="auto"
      mt="80px"
      p={6}
      borderWidth="1px"
      borderRadius="md"
      boxShadow="sm"
    >
      <Stack align="center">
        <Heading as="h2" size="lg">
          404 — Page Not Found
        </Heading>
        <Text color="gray.500">The page you're looking for doesn't exist.</Text>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </Stack>
    </Box>
  );
}
