import React from "react";
import RegionIcon from "@mui/icons-material/PictureInPicture";
import {SidebarBoxContainer} from "../SidebarBoxContainer";
import TextField from "@mui/material/TextField";
import {Alert, Button, CircularProgress, Link} from "@mui/material";
import Typography from "@mui/material/Typography";

export default function CommentBox({projectId, annotationId}) {
  const [content, setContent] = React.useState("");
  const [comments, setComments] = React.useState([]);
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [refreshError, setRefreshError] = React.useState(null);

  function addComment() {
    setError(null);
    setLoading(true);

    if (content.trim().length === 0) {
      setError("Enter comment content");
      setLoading(false);
      return;
    }

    fetch(`/api/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: content,
        annotation: annotationId,
        project: projectId,
      }),
    })
      .then(() => {
        setContent("");
        refreshComments()
          .then(() => {
            setTimeout(scrollToEnd, 250);
          });
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  function refreshComments() {
    setRefreshError(null);
    setLoading(true);

    return new Promise((resolve) => {
      fetch(`/api/comments?ordering=created_at&project=${projectId}&annotation=${annotationId}`, {
        method: "GET",
      })
        .then(r => r.json())
        .then(r => {
          if (typeof r !== "object" || !r.length) {
            return;
          }

          setComments(r);
        })
        .catch(() => setRefreshError("An error has occurred while loading comments."))
        .finally(() => {
          setLoading(false);
          resolve();
        });
    });
  }

  function scrollToEnd() {
    const sidebar = document.getElementById("ria-right-sidebar");

    if (sidebar) {
      sidebar.scrollTo({top: sidebar.scrollHeight, behavior: "smooth"});
    }
  }

  React.useEffect(() => {
    if (error) {
      setTimeout(scrollToEnd, 250);
    }
  }, [error]);

  React.useEffect(() => {
    refreshComments();
  }, [annotationId]);

  return (
    <SidebarBoxContainer
      title="Comments"
      subTitle=""
      icon={<RegionIcon />}
      noScroll={true}
    >
      <div style={{
        paddingLeft: 15,
        paddingRight: 15,
        paddingBottom: 15,
      }}>
        {comments.length === 0 && <Typography fontStyle="italic" textAlign="center">(No comment)</Typography>}
        {comments.map(c => {
          let name = "User #" + c.created_by.id;

          if (c.created_by.first_name.length > 0 || c.created_by.last_name.length > 0) {
            name = (c.created_by.first_name + c.created_by.last_name).trim();
          }

          const date = new Date(c.created_at);

          return (
            <div
              key={"comment-" + c.id}
              style={{
                border: "solid 1px rgba(0,0,0,.2)",
                borderRadius: 8,
                marginBottom: 15,
                padding: 8,
              }}
            >
              <strong>{name}</strong>: {c.text}
              <div
                style={{
                  fontStyle: "italic",
                  marginTop: 8,
                  fontSize: 12,
                  textAlign: "right",
                }}
              >
                {date.toLocaleString()}
              </div>
            </div>
          )
        })}
        {loading && <CircularProgress />}
        {refreshError && (
          <Alert color="error" sx={{marginBottom: "15px"}}>
            {refreshError} <Link onClick={() => refreshComments()} underline="always">Retry</Link>
          </Alert>
        )}
        {error && <Alert color="error" sx={{marginBottom: "15px"}}>{error}</Alert>}
        <TextField
          fullWidth={true}
          multiline={true}
          placeholder="Enter comment content here"
          disabled={loading}
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={e => e.stopPropagation()}
          sx={{
            border: "solid 1px rgba(0, 0, 0, .2)",
            borderRadius: "8px 8px 0 0",
          }}
          inputProps={{
            style: {
              color: "black",
            }
          }}
        />
        <Button
          fullWidth={true}
          color="primary"
          variant="contained"
          onClick={() => addComment()}
          disabled={loading}
          sx={{
            borderRadius: "0 0 8px 8px",
          }}
        >Comment</Button>
      </div>
    </SidebarBoxContainer>
  )
}