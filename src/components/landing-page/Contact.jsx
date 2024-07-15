import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  TextField,
  Button,
} from "@mui/material";
import { styled } from "@mui/system";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

gsap.registerPlugin(ScrollTrigger);

const StyledContactSection = styled("section")(({ theme }) => ({
  background: "#fff",
  paddingTop: "80px",
  paddingBottom: "50px",
  minHeight: "100vh",
  position: "relative",
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontFamily: "Pacifico, cursive",
  color: "#0033a0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 30px auto",
  padding: "20px 0",
  width: "50%",
  "&::before, &::after": {
    content: '""',
    flex: 1,
    height: 2,
    borderBottom: "2px solid #0033a0",
    margin: "0px 15px",
  },
}));

const GlobeContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  height: "400px",
  [theme.breakpoints.up("md")]: {
    height: "600px",
  },
}));

const FormContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#0033a0",
    },
    "&:hover fieldset": {
      borderColor: "#0033a0",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#0033a0",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#0033a0",
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#0033a0",
  color: "#fff",
  "&:hover": {
    backgroundColor: "#002277",
  },
}));

const ContactUs = () => {
  const sectionRef = useRef(null);
  const globeRef = useRef(null);
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      globeRef.current.clientWidth / globeRef.current.clientHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(
      globeRef.current.clientWidth,
      globeRef.current.clientHeight
    );
    globeRef.current.appendChild(renderer.domElement);

    // Create globe
    const globeGeometry = new THREE.SphereGeometry(5, 64, 64);
    const globeMaterial = new THREE.MeshBasicMaterial({
      color: 0x001133,
      transparent: true,
      opacity: 0.8,
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);

    // Create dots for land areas
    const dotsGeometry = new THREE.BufferGeometry();
    const dotsPositions = [];
    const dotsCount = 20000;

    for (let i = 0; i < dotsCount; i++) {
      const lat = Math.random() * 180 - 90;
      const lng = Math.random() * 360 - 180;
      if (isLand(lat, lng)) {
        const { x, y, z } = latLngToVector3(lat, lng);
        dotsPositions.push(x, y, z);
      }
    }

    dotsGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(dotsPositions, 3)
    );

    const dotsMaterial = new THREE.PointsMaterial({
      color: 0x3a7bd5,
      size: 0.05,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });

    const dots = new THREE.Points(dotsGeometry, dotsMaterial);
    scene.add(dots);

    // Create arcs
    const arcs = [];
    const arcCount = 20;

    for (let i = 0; i < arcCount; i++) {
      const startLat = Math.random() * 180 - 90;
      const startLng = Math.random() * 360 - 180;
      const endLat = Math.random() * 180 - 90;
      const endLng = Math.random() * 360 - 180;
      const arc = createArc(startLat, startLng, endLat, endLng);
      arcs.push(arc);
      scene.add(arc);
    }

    function createArc(startLat, startLng, endLat, endLng) {
      const start = latLngToVector3(startLat, startLng);
      const end = latLngToVector3(endLat, endLng);

      const distance = start.distanceTo(end);
      const midHeight = distance * 0.3;
      const mid = start
        .clone()
        .lerp(end, 0.5)
        .normalize()
        .multiplyScalar(5 + midHeight);

      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const points = curve.getPoints(50);

      const arcGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const arcMaterial = new THREE.LineBasicMaterial({
        color: 0x3a7bd5,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
      });

      return new THREE.Line(arcGeometry, arcMaterial);
    }

    function latLngToVector3(lat, lng) {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      const x = -5 * Math.sin(phi) * Math.cos(theta);
      const y = 5 * Math.cos(phi);
      const z = 5 * Math.sin(phi) * Math.sin(theta);
      return new THREE.Vector3(x, y, z);
    }

    function isLand(lat, lng) {
      // This is a simplified check. You might want to use a more accurate method
      // or a dataset of land coordinates for better results.
      const x = (lng + 180) / 360;
      const y = (lat + 90) / 180;

      // Simplified world map
      const landMap = [
        [0.1, 0.3, 0.15, 0.35], // North America
        [0.25, 0.4, 0.05, 0.25], // South America
        [0.4, 0.55, 0.1, 0.6], // Europe
        [0.45, 0.55, 0.55, 1.0], // Africa
        [0.55, 0.9, 0.1, 0.6], // Asia
        [0.7, 0.9, 0.75, 1.0], // Australia
        [0.1, 0.9, 0.9, 1.0], // Antarctica
      ];

      for (const [x1, x2, y1, y2] of landMap) {
        if (x >= x1 && x <= x2 && y >= y1 && y <= y2) {
          return true;
        }
      }
      return false;
    }

    camera.position.z = 10;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = false;

    const animate = () => {
      requestAnimationFrame(animate);
      globe.rotation.y += 0.001;
      dots.rotation.y += 0.001;
      arcs.forEach((arc) => {
        arc.rotation.y += 0.001;
        // Fade in and out effect for arcs
        arc.material.opacity = (Math.sin(Date.now() * 0.001) + 1) * 0.25 + 0.25;
      });
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // GSAP animations
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top center",
        end: "bottom center",
        scrub: 0.5,
      },
    });

    tl.fromTo(
      globe.scale,
      { x: 0.7, y: 0.7, z: 0.7 },
      { x: 1, y: 1, z: 1, duration: 0.5 }
    ).fromTo(
      formRef.current,
      { x: 50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5 },
      "-=0.3"
    );

    return () => {
      renderer.dispose();
      globeRef.current.removeChild(renderer.domElement);
    };
  }, []);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Here you would typically send the form data to your backend
      // For this example, we'll just log it to the console
      console.log("Form data:", formData);
      // You can add code here to send an email to c191542709@gmail.com
      alert("Form submitted successfully!");
    }
  };

  return (
    <StyledContactSection id="contact-us" ref={sectionRef}>
      <SectionTitle variant="h4">Contact Us</SectionTitle>
      <Container>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <GlobeContainer ref={globeRef} />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormContainer ref={formRef}>
              <form onSubmit={handleSubmit}>
                <StyledTextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  error={!!errors.name}
                  helperText={errors.name}
                />
                <StyledTextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={!!errors.email}
                  helperText={errors.email}
                />
                <StyledTextField
                  fullWidth
                  label="Subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  error={!!errors.subject}
                  helperText={errors.subject}
                />
                <StyledTextField
                  fullWidth
                  label="Message"
                  name="message"
                  multiline
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                  error={!!errors.message}
                  helperText={errors.message}
                />
                <StyledButton type="submit" variant="contained" fullWidth>
                  Send
                </StyledButton>
              </form>
            </FormContainer>
          </Grid>
        </Grid>
      </Container>
    </StyledContactSection>
  );
};

export default ContactUs;
