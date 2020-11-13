import { Badge, Box, Container, Label, Button, Text, Image, Link } from 'theme-ui';
import { signIn } from 'next-auth/client';

const AboutTray = (props) => {
  return (
    <Box>
      <Text variant="large">
        welcome to <Badge variant="outline">tray</Badge>
      </Text>
      <Text variant="large">a new way to share notes, links, and music.</Text>
      {/* <Text variant="tiny" sx={{ pt: 3, pb: 2, color: 'gray' }}>
        <Badge variant="outline" sx={{ fontSize: 10, color: 'gray' }}>
          tray
        </Badge>{' '}
        is free software, made by{' '}
        <Link variant="primary" href="https://tray.club/@bgdotjpg">
          @bgdotjpg
        </Link>
      </Text> */}
    </Box>
  );
};
export default AboutTray;
