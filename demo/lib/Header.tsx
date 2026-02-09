import * as React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Tooltip,
  Box,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import GitHubIcon from "@mui/icons-material/GitHub";

interface HeaderProps {
  selection: any;
  showSelectionMeta: boolean;
  toggleShowSelectionMeta: () => void;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({
  selection,
  showSelectionMeta,
  toggleShowSelectionMeta,
  toggleSidebar,
}) => (
  <Box sx={{ flexGrow: 0 }}>
    <AppBar
      position="static"
      color="inherit"
      elevation={1}
      sx={{
        borderBottom: "1px solid #f0f1f2",
        boxShadow: "0 2px 8px #f0f1f2",
      }}
    >
      <Toolbar sx={{ minHeight: "64px !important", px: 2 }}>
        <Tooltip title="Options" placement="bottom-start">
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleSidebar}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        </Tooltip>

        <Box sx={{ flexGrow: 1, pl: 2 }}>
          <Button
            variant={!showSelectionMeta ? "contained" : "outlined"}
            onClick={toggleShowSelectionMeta}
            sx={{
              width: 120,
              color: !showSelectionMeta ? "white" : "primary",
            }}
          >
            {showSelectionMeta ? "HIDE META" : "SHOW META"}
          </Button>
        </Box>

        <Box
          sx={{
            borderLeft: "1px solid #f0f0f0",
            borderRight: "1px solid #f0f0f0",
            px: 2,
            height: "64px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <a
            href="https://github.com/Lattice-Automation/seqviz"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "inherit", display: "flex", alignItems: "center" }}
          >
            <GitHubIcon fontSize="large" />
          </a>
        </Box>

        <Box sx={{ pl: 2 }}>
          <img
            src="https://seqviz.latticeautomation.com/seqviz-logo.png"
            alt="SeqViz"
            style={{ height: "48px" }}
          />
        </Box>
      </Toolbar>
    </AppBar>

    {showSelectionMeta && (
      <Box
        sx={{
          position: "absolute",
          top: "72px",
          left: "10px",
          width: "calc(50% - 20px)",
          height: "24px",
          bgcolor: "white",
          boxShadow: "0 2px 8px #f0f1f2",
          display: "flex",
          px: 2,
          zIndex: 1000,
        }}
      >
        <SelectionMetaRow selection={selection} />
      </Box>
    )}
  </Box>
);

export default Header;

const SelectionMetaRow: React.FC<{ selection: any }> = ({ selection }) => {
  const { end, feature, length, start } = selection;
  const noneSelected = start === end;

  return (
    selection && (
      <Box sx={{ display: "flex", height: "24px", width: "100%" }}>
        {noneSelected && (
          <MetaDatum>
            <Typography variant="caption">
              Make a selection on the circular or linear viewer.
            </Typography>
          </MetaDatum>
        )}
        {feature && (
          <MetaDatum maxWidth="400px">
            <Typography variant="caption" fontWeight="bold" mr={1}>
              FEATURE
            </Typography>
            <Typography
              variant="caption"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {feature.name}
            </Typography>
          </MetaDatum>
        )}
        {feature && feature.type && (
          <MetaDatum maxWidth="200px">
            <Typography variant="caption" fontWeight="bold" mr={1}>
              TYPE
            </Typography>
            <Typography
              variant="caption"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {feature.type}
            </Typography>
          </MetaDatum>
        )}
        {length !== 0 && (
          <MetaDatum>
            <Typography variant="caption" fontWeight="bold" mr={1}>
              LENGTH
            </Typography>
            <Typography variant="caption">{length}bp</Typography>
          </MetaDatum>
        )}
        {start !== end && (
          <MetaDatum>
            <Typography variant="caption" fontWeight="bold" mr={1}>
              RANGE
            </Typography>
            <Typography variant="caption">
              {start + 1} - {end + 1}
            </Typography>
          </MetaDatum>
        )}
      </Box>
    )
  );
};

const MetaDatum: React.FC<{
  children: React.ReactNode;
  maxWidth?: string;
}> = ({ children, maxWidth }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      px: 1,
      fontSize: "0.8em",
      maxWidth,
      "&:not(:last-child)": {
        borderRight: "1px solid #f0f0f0",
      },
      "&:hover": {
        bgcolor: "rgb(255, 251, 196)",
      },
    }}
  >
    {children}
  </Box>
);

