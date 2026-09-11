// PHYSICS — MDCAT Master Concept Notes (auto-converted from corpus analysis).
type _NoteBlock = { type: 'bullet' | 'para'; text: string }
type _NoteTopic = { title: string; blocks: _NoteBlock[] }
type NoteSection = { title: string; topics: _NoteTopic[] }
export const MCAT_PHYSICS_NOTES_SECTIONS: NoteSection[] = [
  {
    title: "u1 \u2014 Vectors & Equilibrium",

    topics: [

      {
        title: "Vectors and their products",
        blocks: [
          { type: 'bullet', text: "Dot product of two unit vectors = cos\u03b8; the dot product of a vector with itself = A\u00b2" },
          { type: 'bullet', text: "If a dot product is negative and one vector lies along the +x-axis, the projection of the" },
          { type: 'bullet', text: "Vector product of two vectors (cross product) gives a magnitude and a unit vector; the" },
          { type: 'bullet', text: "Vector product magnitude = \u221a3 \u00d7 scalar product \u21d2 tan\u03b8 = \u221a3 \u21d2 angle = 60\u00b0." },
          { type: 'bullet', text: "Dot product of A (4,3,2) \u00b7 B (1,5,2) = 4 + 15 + 4 = 23." },
          { type: 'bullet', text: "A = 2i+3j, B = \u22126i+4j: dot = \u221212+12 = 0 \u21d2 angle = 90\u00b0." },
          { type: 'bullet', text: "A particle moving in a circle describing equal angles in equal times has velocity that" },
          { type: 'bullet', text: "Kinetic energy is a dot (scalar) product of vectors (\u00bdmv\u00b2)." },
          { type: 'bullet', text: "Quantity of motion due to mass and velocity = momentum." },
          { type: 'bullet', text: "The right-hand rule gives the direction of angular velocity (and angular displacement). \u00d72" },
          { type: 'bullet', text: "On a 3\u2011D Cartesian system the components given let you build dot products directly from" },
        ],
      },
      {
        title: "Torque and equilibrium",
        blocks: [
          { type: 'bullet', text: "A couple = two forces equal and opposite, not collinear: it gives no net force but a net" },
          { type: 'bullet', text: "Doubling the moment arm doubles the torque (\u03c4 = F\u00b7\u2113)." },
          { type: 'bullet', text: "Moment of a force F acting at angle \u03b8 to the vertical on a bar of length L = LF sin\u03b8." },
          { type: 'bullet', text: "Forces 5 N and 10 N at equilibrium on a uniform metre rod suspended at the 50 cm mark \u2014 the" },
          { type: 'bullet', text: "A stream of air blown under one pan of a physical balance makes that pan go up." },
        ],
      },
      {
        title: "Vector\u2013scalar identification",
        blocks: [
          { type: 'bullet', text: "Which is a vector quantity \u2014 keyed electric flux (per the official key)." },
          { type: 'bullet', text: "Angular displacement behaves as a vector only for very small rotations. \u2192u4" },
        ],
      },
      {
        title: "Cross-subject strays bucketed into u1 (chemistry equilibrium)",
        blocks: [
          { type: 'bullet', text: "Buffer/equilibrium items (ammonium hydroxide\u2013ammonium chloride buffer, BiCl\u2083 + H\u2082O cloudy" },
        ],
      },
    ],
  },
  {
    title: "u2 \u2014 Force & Motion",

    topics: [

      {
        title: "Graphs and defined quantities (all \u00d75)",
        blocks: [
          { type: 'bullet', text: "Acceleration = the gradient (slope) of the velocity\u2013time graph. \u00d75" },
          { type: 'bullet', text: "Rate of change of linear momentum = force. \u00d75" },
          { type: 'bullet', text: "If the slope of the velocity\u2013time graph gradually decreases, the body moves with" },
          { type: 'bullet', text: "Area under a velocity\u2013time graph = displacement (distance covered)." },
          { type: 'bullet', text: "A displacement\u2013time straight line at 45\u00b0 means constant velocity (v = slope)." },
        ],
      },
      {
        title: "Momentum, collisions, impulse",
        blocks: [
          { type: 'bullet', text: "Quantity of motion of a body is measured by momentum. \u00d75" },
          { type: 'bullet', text: "Two bodies with KE ratio 4:1 and equal momentum have masses in ratio 1:4 (KE = p\u00b2/2m)." },
          { type: 'bullet', text: "Rate of change of momentum = force; the momentum of a body is changed by an impulse." },
          { type: 'bullet', text: "In a 1\u2011D elastic collision of two equal masses, one at rest \u2192 velocities are interchanged." },
          { type: 'bullet', text: "In an elastic collision total kinetic energy before and after remains the same. \u00d72" },
          { type: 'bullet', text: "A rolling cart collides with a stationary equal-mass cart and they stick: momentum is" },
          { type: 'bullet', text: "Two bodies that collide and stick (inelastic): only momentum is conserved." },
          { type: 'bullet', text: "Relative speed of approach in an elastic collision = relative speed of separation (equal" },
          { type: 'bullet', text: "Canon recoil happens due to Newton's third law of motion. \u00d73" },
          { type: 'bullet', text: "Bullet 20 g at 100 m/s from an 8 kg rifle \u2192 recoil velocity 0.25 m/s (momentum conserved)." },
          { type: 'bullet', text: "Water out at 3 kg/s, velocity changing 5\u21920 on a wall \u2192 force = 15 N." },
        ],
      },
      {
        title: "Projectiles",
        blocks: [
          { type: 'bullet', text: "Range is maximum when sin2\u03b8 = 1 (\u03b8 = 45\u00b0)." },
          { type: 'bullet', text: "Angle giving \u00bc of the maximum height is 30\u00b0 (sin\u00b2\u03b8 = \u00bc). \u00d75" },
          { type: 'bullet', text: "Universal 2\u2011D motion under constant g is called projectile motion." },
          { type: 'bullet', text: "At maximum height the projectile's velocity is minimum but not zero (only the vertical" },
          { type: 'bullet', text: "Horizontal component of velocity stays constant throughout (no air resistance). \u00d72" },
          { type: 'bullet', text: "Projectile with time of flight 8 s: total vertical displacement on landing = 0 (returns" },
          { type: 'bullet', text: "A ball thrown vertically up at 20 m/s returns to its starting height at \u221220 m/s (same speed," },
        ],
      },
      {
        title: "Circular/rotational basics (cross-topic with u2)",
        blocks: [
          { type: 'bullet', text: "Uniform circular motion: velocity \u22a5 acceleration, acceleration points to centre. \u00d72" },
          { type: 'bullet', text: "Object moving in a circle with constant speed \u2192 force acting toward the centre." },
          { type: 'bullet', text: "Travel once around a circle at constant speed: displacement is zero, but average speed NOT" },
          { type: 'bullet', text: "Vertical-circle minimum velocity at the highest point = \u221a(gr)." },
          { type: 'bullet', text: "Second hand 1 cm long \u2192 tip speed = 2\u03c0/60 cm/s (v = \u03c9r, \u03c9 = 2\u03c0/60)." },
          { type: 'bullet', text: "Every particle of a rotating disc has constant angular velocity." },
          { type: 'bullet', text: "Disc, hoop and sphere of equal mass/radius rolling down \u2014 the sphere reaches the ground" },
          { type: 'bullet', text: "Angular momentum plays in rotation the role linear momentum plays in translation." },
          { type: 'bullet', text: "A particle doing a full revolution has displacement zero." },
          { type: 'bullet', text: "Motorcyclist on a circular track at constant speed keeps constant angular velocity." },
        ],
      },
      {
        title: "Elevator/weight apparent weight",
        blocks: [
          { type: 'bullet', text: "Elevator moving up at constant velocity \u2192 apparent weight = mg (no change)." },
          { type: 'bullet', text: "Elevator ascending with acceleration \u2192 apparent weight increased." },
          { type: 'bullet', text: "Elevator accelerating downward (a = g) \u2192 apparent weight zero (weightless). \u00d72" },
          { type: 'bullet', text: "1 kg on a balance in an elevator accelerating down at 4 m/s\u00b2 \u2192 reading 5.8 N (m(g\u2212a))." },
        ],
      },
      {
        title: "SHM and simple harmonic motion",
        blocks: [
          { type: 'bullet', text: "SHM with time period 10 s \u2192 a = \u2212(2\u03c0/10)\u00b2 x. \u00d72" },
          { type: 'bullet', text: "In SHM the phase difference between displacement and acceleration = 180\u00b0." },
          { type: 'bullet', text: "Velocity of a body in SHM = \u03c9\u221a(x\u2080\u00b2 \u2212 x\u00b2). \u00d73" },
          { type: 'bullet', text: "Amplitude doubled \u2192 maximum velocity doubles (vmax = \u03c9x\u2080)." },
          { type: 'bullet', text: "Graph of acceleration vs displacement in SHM is a straight line (through origin, negative" },
          { type: 'bullet', text: "Velocity in SHM is maximum at the mean position; at an extreme position velocity is zero" },
          { type: 'bullet', text: "SHM total mechanical energy does not vary with time." },
          { type: 'bullet', text: "Resultant displacement of two superposed waves = y\u2081 + y\u2082 (superposition). \u2192u6" },
        ],
      },
      {
        title: "Fluid flow & terminal velocity (u2 misfiled fluid items)",
        blocks: [
          { type: 'bullet', text: "Blood vessel narrows \u2192 velocity increases, pressure decreases." },
          { type: 'bullet', text: "Pipe 0.02 m\u00b2 at 3 m/s narrowing to 0.01 m\u00b2 \u2192 velocity 6 m/s (never crosses continuity)." },
          { type: 'bullet', text: "Bernoulli: blood pressure drops when velocity increases in a narrow vessel." },
          { type: 'bullet', text: "Speed of gas molecules vs temperature: v = \u221a(3RT/M) (rms speed)." },
          { type: 'bullet', text: "In circular motion, with angular displacement constant, decreasing the radius decreases linear" },
          { type: 'bullet', text: "A car at 36 km/h doubling speed in 10 s, wheel radius 25 cm \u2192 ~135 revolutions (figure" },
          { type: 'bullet', text: "Maximum constant velocity through a fluid = terminal velocity \u2192 u5." },
        ],
      },
      {
        title: "Waves and sound (misfiled)",
        blocks: [
          { type: 'bullet', text: "If 20 waves pass in 1 s at 20 m/s \u2192 wavelength = 1 m. \u2192u6" },
          { type: 'bullet', text: "1/f = T; velocity of sound in air is independent of pressure; speed of sound in vacuum" },
          { type: 'bullet', text: "Frequency of oscillation m/k = \u00bc \u2192 period = \u03c0 (T = 2\u03c0\u221a(m/k)). \u2192u6" },
          { type: 'bullet', text: "Any displacement due to two waves y\u2081 and y\u2082 \u2192 resultant y = y\u2081 + y\u2082. \u2192u6" },
        ],
      },
      {
        title: "Electron orbit velocity",
        blocks: [
          { type: 'bullet', text: "Electron in 1st hydrogen orbit at 2.18\u00d710\u2076 m/s: velocity in the 3rd orbit = 0.73\u00d710\u2076 m/s" },
        ],
      },
    ],
  },
  {
    title: "u3 \u2014 Work & Energy",

    topics: [

      {
        title: "Work, power, engines (all \u00d75 where marked)",
        blocks: [
          { type: 'bullet', text: "In an isochoric (constant\u2011volume) process the work done by the gas = zero. \u00d75" },
          { type: 'bullet', text: "In the British system, 1000 hp = 746000 watts (1 hp = 746 W). \u00d75" },
          { type: 'bullet', text: "KE becomes 4\u00d7 \u21d2 momentum becomes 2\u00d7 (p \u221d \u221aKE). \u00d75" },
          { type: 'bullet', text: "Man pulls 50 m with 100 N at 60\u00b0 \u2192 work = 2500 J (F\u00b7d\u00b7cos60\u00b0). \u00d75" },
          { type: 'bullet', text: "SI unit of power = watt; base unit set kg m\u00b2 s\u207b\u00b3 measures power." },
          { type: 'bullet', text: "A 1 N force displacing its point of application 1 m in its own direction does 1 J of work." },
          { type: 'bullet', text: "Man pushes a wall with 100 N for 10 s \u2192 work = zero (no displacement). \u00d72" },
          { type: 'bullet', text: "Holding a bag / pushing a wall is a case of zero work (no displacement of application" },
          { type: 'bullet', text: "Gravitational work lifting weight w through height h = \u2212wh (force opposes motion)." },
          { type: 'bullet', text: "Work by gravity on a body moving horizontally = 0; a girl carrying a 3 kg bag over 200 m" },
          { type: 'bullet', text: "Work done on a satellite by Earth's gravity is zero (force \u22a5 displacement)." },
          { type: 'bullet', text: "Work by gravity on a body on a smooth horizontal surface = 0." },
          { type: 'bullet', text: "0.5 kg ball at 6 m/s \u2192 KE = 9 J (\u00bdmv\u00b2)." },
          { type: 'bullet', text: "KE = p\u00b2/2m; doubling velocity quadruples KE." },
          { type: 'bullet', text: "Power output of a motor lifting 2 N through 100 cm in 4 s = 0.5 W." },
          { type: 'bullet', text: "In an ideal transformer power input = power output. \u00d72" },
          { type: 'bullet', text: "Increasing current in power\u2011transmission lines increases heat produced in the wires." },
        ],
      },
      {
        title: "First law & thermodynamic processes",
        blocks: [
          { type: 'bullet', text: "Gas expanding against constant pressure P from V\u2081 to V\u2082 does work = P(V\u2082 \u2212 V\u2081). \u00d73" },
          { type: 'bullet', text: "Isobaric process \u2192 work done = P\u0394V." },
          { type: 'bullet', text: "Isothermal expansion of an ideal gas doing 200 J of work absorbs 200 J of heat (\u0394U = 0)." },
          { type: 'bullet', text: "Adiabatic expansion \u2192 work done by the gas is positive (temperature and internal energy" },
          { type: 'bullet', text: "Compressing a gas 4 L \u2192 2 L at 2 kPa does work \u22124 J." },
          { type: 'bullet', text: "Area under a P\u2013V graph = work done by/on the gas. \u00d72" },
          { type: 'bullet', text: "The SI unit of thermodynamic work = joule." },
          { type: 'bullet', text: "In the P\u2013V cycle A\u2192B\u2192C (work 30 J, heat in 40 J) \u2192 \u0394U = 10 J (Q = W + \u0394U)." },
          { type: 'bullet', text: "Work in the ABCA cycle at (P,V),(3P,3V),(P,3V) = 2PV (area of the rectangle)." },
          { type: 'bullet', text: "Heat flow between hot/cold bodies continues until all molecules have equal average translational" },
          { type: 'bullet', text: "For an ideal gas the molecular potential energy = zero." },
          { type: 'bullet', text: "Heating an ideal gas in a fixed cylinder (isochoric) raises the kinetic energy of the" },
          { type: 'bullet', text: "Real gases cannot reach absolute zero in practice because intermolecular forces exceed the" },
          { type: 'bullet', text: "An increase in internal energy can do everything EXCEPT \"raise temperature by dropping the" },
          { type: 'bullet', text: "The process in which all supplied heat converts to work = isothermal (Q = W, \u0394U = 0)." },
          { type: 'bullet', text: "First law of thermodynamics: energy cannot be created or destroyed \u2014 conservation of energy." },
        ],
      },
      {
        title: "Kinetic theory / pressure / states",
        blocks: [
          { type: 'bullet', text: "SI unit of pressure = pascal." },
          { type: 'bullet', text: "Renewable energy source of the list = solar energy (coal, natural gas, petroleum are not)." },
          { type: 'bullet', text: "Marble chips + dilute HCl gas evolution \u2192 gas expands, so work is done by the system (w" },
        ],
      },
      {
        title: "Radiation ionisation",
        blocks: [
          { type: 'bullet', text: "Nuclear radiation: least penetrating = greatest ionising; greatest penetrating = least" },
          { type: 'bullet', text: "Maximum ionising power = \u03b1\u2011rays; greatest penetrating power = \u03b3\u2011rays. \u00d72" },
        ],
      },
      {
        title: "SHM energy",
        blocks: [
          { type: 'bullet', text: "Potential energy per unit volume = \u03c1gh; gravitational PE at height h = mgh (below" },
          { type: 'bullet', text: "Strain energy in a deformed body is stored as potential (elastic) energy." },
          { type: 'bullet', text: "KE of a mass\u2011spring oscillator at displacement x = \u00bdkx\u2080\u00b2(1 \u2212 x\u00b2/x\u2080\u00b2)." },
          { type: 'bullet', text: "Ratio of KE to total energy of an SHO = 1 \u2212 x\u00b2/x\u2080\u00b2." },
          { type: 'bullet', text: "KE = PE when x = x\u2080/\u221a2; KE = 2\u00d7PE when x = x\u2080/\u221a3." },
          { type: 'bullet', text: "At the extreme positions of SHM the potential energy is maximum. \u00d72" },
          { type: 'bullet', text: "Electron has maximum KE when it has short wavelength (E = hc/\u03bb)." },
        ],
      },
      {
        title: "Misc / bled",
        blocks: [
          { type: 'bullet', text: "Magnifying power M = 1 + d/f (f = 5 cm, d = 25 cm) \u2192 M = 6. \u2192u13" },
          { type: 'bullet', text: "KE with which an electron strikes the X\u2011ray target = eV. \u2192u15" },
          { type: 'bullet', text: "Photo-electric KE is controlled by frequency \u2014 this keyed item is recorded under u6" },
          { type: 'bullet', text: "Corrections to the corpus: the S.I.\u2011unit of pressure (pascal) and the renewable\u2011source item are" },
        ],
      },
    ],
  },
  {
    title: "u4 \u2014 Rotational & Circular Motion",

    topics: [

      {
        title: "Angles, radians, degrees (most \u00d73\u2013\u00d77)",
        blocks: [
          { type: 'bullet', text: "1 degree = \u03c0/180 rad; \u03c0 radians = 180\u00b0; one complete rotation = 2\u03c0 rad; half a" },
          { type: 'bullet', text: "Angle subtended by an arc equal to twice the radius = 2 radians; an arc equal to 1/60\u00b0 is" },
          { type: 'bullet', text: "Three turns (or revolutions) = 3 \u00d7 2\u03c0 = 18.8 rad; a wheel of 3 revolutions \u2192 6\u03c0 rad;" },
          { type: 'bullet', text: "Angular displacement \u03b8 = s/r; arc length s = r\u03b8; linear & angular accl a = r\u03b1;" },
          { type: 'bullet', text: "Radius 4 m, arc 14 m \u2192 \u03b8 = 3.5 rad; point on wheel rotating 180\u00b0 (r = 1 m) \u2192 linear" },
          { type: 'bullet', text: "12 revolutions in 4 s \u2192 average angular velocity = 3 rev/s (or 6\u03c0 \u2248 18.8 rad/s). \u00d77" },
          { type: 'bullet', text: "Motor at 400 rpm \u2192 \u03c9 = 40\u03c0/3 rad/s; electric motor 400 rev/min \u2192 40\u03c0/3 rad/s." },
          { type: 'bullet', text: "Aircraft turning radius 100 m at 250 m/s \u2192 \u03c9 = 2.5 rad/s." },
          { type: 'bullet', text: "Wheel radius 0.4 m with \u03b1 = 6 rad/s\u00b2 \u2192 linear acceleration 2.4 m/s\u00b2." },
          { type: 'bullet', text: "Flywheel 0 \u2192 40 rad/s in 8 s \u2192 angular displacement 160 rad." },
          { type: 'bullet', text: "Disk starts from rest, \u03b1 = 4 rad/s\u00b2, after 3 s \u2192 \u03c9 = 12 rad/s." },
          { type: 'bullet', text: "Linear velocity doubled at same radius \u2192 angular velocity doubles (\u03c9 = v/r)." },
          { type: 'bullet', text: "Particle on radius 100 mm at 10 cm/s \u2192 \u03c9 = 1 rad/s \u2192 answer \"none of the given\" (value not" },
          { type: 'bullet', text: "Earth's daily rotation angular speed = \u03c0/12 rad per hour (2\u03c0/24 h)." },
          { type: 'bullet', text: "Ratio of hour\u2011hand \u03c9 to Earth's \u03c9 = 2:1. \u00d72" },
          { type: 'bullet', text: "At 4 o'clock the hour\u2013minute angular separation = 2\u03c0/3 (120\u00b0)." },
          { type: 'bullet', text: "Braking a flywheel 900 \u2192 720 cycle/min in 6 s \u2192 angular retardation = \u03c0 rad/s\u00b2." },
        ],
      },
      {
        title: "Direction of angular quantities",
        blocks: [
          { type: 'bullet', text: "Right\u2011hand rule gives direction of angular velocity/displacement; the direction is along the" },
          { type: 'bullet', text: "Positive angular displacement \u2192 anticlockwise rotation." },
          { type: 'bullet', text: "Body in the xy\u2011plane \u2192 angular displacement along the z\u2011axis." },
          { type: 'bullet', text: "Anticlockwise motion in a horizontal plane \u2192 angular velocity out of the page (+z). \u00d72" },
          { type: 'bullet', text: "Rotating clockwise with decreasing \u03c9 \u2192 angular acceleration out of the plane." },
          { type: 'bullet', text: "Angle between linear velocity v and angular velocity \u03c9 in a circle = 90\u00b0." },
          { type: 'bullet', text: "Direction of angular velocity = axis of rotation." },
          { type: 'bullet', text: "Angular displacement is a vector only for small rotations / small time intervals. \u00d73" },
        ],
      },
      {
        title: "Centripetal force and acceleration (most \u00d73+)",
        blocks: [
          { type: 'bullet', text: "Instantaneous inward acceleration of uniform circular motion = centripetal acceleration. \u00d76" },
          { type: 'bullet', text: "Centripetal acceleration = r\u03c9\u00b2 = v\u00b2/r = 4\u03c0\u00b2r/T\u00b2. \u00d75" },
          { type: 'bullet', text: "Centripetal force = mr\u03c9\u00b2 = mv\u00b2/r; radial acceleration = centripetal acceleration. \u00d74" },
          { type: 'bullet', text: "Centripetal force in SI is measured in newtons (N); its direction is towards the centre." },
          { type: 'bullet', text: "Radius doubled at constant \u03c9 \u2192 centripetal acceleration doubles (a = r\u03c9\u00b2)." },
          { type: 'bullet', text: "Velocity \u00d72 and radius \u00d74 \u2192 centripetal force unchanged (F = mv\u00b2/r: (2v)\u00b2/4r = v\u00b2/r)." },
          { type: 'bullet', text: "Mass halved, radius doubled, v constant \u2192 centripetal force halves." },
          { type: 'bullet', text: "Mass doubled at same radius \u2192 centripetal force doubles. \u00d73" },
          { type: 'bullet', text: "Centrifugal force = mv\u00b2/r." },
          { type: 'bullet', text: "On a circular track the centripetal force is provided by friction between tyres and road." },
          { type: 'bullet', text: "A cyclist skids when the limiting friction is less than the required centripetal force." },
          { type: 'bullet', text: "A rotating space-station produces artificial gravity by pushing objects to the outer wall." },
          { type: 'bullet', text: "Car 1000 kg at 20 m/s, radius 50 m \u2192 centripetal force = 8000 N." },
        ],
      },
      {
        title: "Torque, angular momentum, moment of inertia",
        blocks: [
          { type: 'bullet', text: "A body rotating with uniform angular velocity experiences zero torque." },
          { type: 'bullet', text: "Torque produces angular acceleration; torque = rate of change of angular momentum." },
          { type: 'bullet', text: "Dimensions of angular momentum = [ML\u00b2T\u207b\u00b9]." },
          { type: 'bullet', text: "Angular momentum of a particle changing 0 \u2192 720 J\u00b7s in 4 s \u2192 torque = 180 N\u00b7m." },
          { type: 'bullet', text: "Bohr's allowed orbits have angular momentum = nh/2\u03c0." },
          { type: 'bullet', text: "Moment of inertia is NOT a vector (it is the rotational analog of mass)." },
          { type: 'bullet', text: "Ratio of moments of inertia 2:3 at the same angular acceleration \u2192 torques in ratio 2:3." },
          { type: 'bullet', text: "Angular momentum is the rotational analog of linear momentum." },
          { type: 'bullet', text: "A neutron entering a magnetic field perpendicular to its velocity moves in a straight line" },
        ],
      },
      {
        title: "Apparent weight / gravity",
        blocks: [
          { type: 'bullet', text: "A lift falling freely \u2192 apparent weight zero (80 kg man, weightless). \u00d72" },
          { type: 'bullet', text: "Object suspended in an elevator accelerating down at g \u2192 apparent weight = zero." },
          { type: 'bullet', text: "1 kg on a balance in an elevator decelerating (or accelerating down at a) reads m(g \u2212 a)." },
        ],
      },
      {
        title: "Misc bled",
        blocks: [
          { type: 'bullet', text: "Phase difference \u03c0/2 \u2192 path difference \u03bb/4; 90\u00b0 phase = \u03c0/2 radians. \u2192u6" },
          { type: 'bullet', text: "Angular frequency of the SHM projection of uniform circular motion = \u03c9. \u2192u6" },
          { type: 'bullet', text: "In an ideal transformer, doubling primary voltage at same turns ratio halves the secondary" },
          { type: 'bullet', text: "Earth's energy comes directly from the Sun. \u2192u16" },
          { type: 'bullet', text: "90\u00b0 of angular displacement = one-fourth of a revolution (keyed)." },
        ],
      },
    ],
  },
  {
    title: "u5 \u2014 Fluid Dynamics",

    topics: [

      {
        title: "Viscosity and Stokes' law",
        blocks: [
          { type: 'bullet', text: "Stokes' law: drag force F = 6\u03c0\u03b7rv (sphere in a viscous fluid). \u00d73" },
          { type: 'bullet', text: "Coefficient of viscosity has dimensions [ML\u207b\u00b9T\u207b\u00b9], SI unit kg m\u207b\u00b9 s\u207b\u00b9." },
          { type: 'bullet', text: "Stokes' law applies to spherical surfaces (a sphere)." },
          { type: 'bullet', text: "As speed through a fluid increases, the drag force increases." },
          { type: 'bullet', text: "The retarding force a moving object feels in a fluid = drag force." },
          { type: 'bullet', text: "When the drag force equals the weight, a droplet falls at constant speed (terminal velocity)." },
          { type: 'bullet', text: "The maximum constant velocity through a fluid is the terminal velocity; terminal" },
          { type: 'bullet', text: "Radius halved \u2192 terminal velocity becomes one\u2011fourth (vt \u221d r\u00b2)." },
          { type: 'bullet', text: "At terminal velocity the acceleration is zero and the net force is zero. \u00d74" },
          { type: 'bullet', text: "A rain droplet reaches constant speed because of the viscous force (drag) of the air." },
          { type: 'bullet', text: "Net force on a sphere falling in a fluid = weight \u2212 drag." },
          { type: 'bullet', text: "A 1 g droplet reaching max speed 20 m/s \u2192 drag force = 9.8\u00d710\u207b\u00b3 N (\u2248 its weight)." },
          { type: 'bullet', text: "Max drag = 9.8 N at zero acceleration \u2192 real weight = 9.8 N." },
          { type: 'bullet', text: "10 kg body at terminal velocity \u2192 net force = 0 N." },
          { type: 'bullet', text: "A heavy coin falling a short distance doesn't reach terminal velocity because its weight is" },
          { type: 'bullet', text: "According to Stokes' law terminal velocity is directly proportional to the square of the" },
          { type: 'bullet', text: "A sphere dropped in a viscous liquid shows a characteristic velocity\u2013displacement curve" },
        ],
      },
      {
        title: "Equation of continuity",
        blocks: [
          { type: 'bullet', text: "A\u2081v\u2081 = A\u2082v\u2082 expresses conservation of mass in steady flow. \u00d72" },
          { type: 'bullet', text: "Cross\u2011sectional area \u00d7 velocity \u00d7 time = volume of fluid that passes." },
          { type: 'bullet', text: "The product of area and velocity at any point in streamline flow is constant." },
          { type: 'bullet', text: "When the pipe narrows the fluid speeds up (to keep mass flow rate constant). \u00d73" },
          { type: 'bullet', text: "Velocity doubled \u2192 area halved (continuity)." },
          { type: 'bullet', text: "Water 3 m/s in a 4 cm pipe entering a 2 cm pipe \u2192 12 m/s (area \u221d d\u00b2 \u2192 velocity \u00d74)." },
          { type: 'bullet', text: "In a narrowing region the fluid has high velocity and low pressure (Bernoulli). \u00d72" },
        ],
      },
      {
        title: "Bernoulli's equation",
        blocks: [
          { type: 'bullet', text: "Bernoulli's equation is based on conservation of energy. \u00d72" },
          { type: 'bullet', text: "\u00bd\u03c1v\u00b2 is the kinetic energy per unit volume; 1/2 \u03c1v\u00b2 has the same unit as pressure." },
          { type: 'bullet', text: "For a horizontal pipe, P + \u00bd\u03c1v\u00b2 = constant (gravity term drops out). \u00d73" },
          { type: 'bullet', text: "Bernoulli: P + \u03c1gh + \u00bd\u03c1v\u00b2 = constant along a streamline." },
          { type: 'bullet', text: "In a horizontal tube the pressure is lowest where velocity is highest (diameter smallest)." },
          { type: 'bullet', text: "The pressure at the narrow end is lower because velocity is higher." },
          { type: 'bullet', text: "\u00bc the increased KE with decreased pressure in a horizontal pipe is a consequence of Bernoulli's" },
          { type: 'bullet', text: "v = \u221a(2g(h\u2081 \u2212 h\u2082)) is Torricelli's theorem (efflux speed)." },
          { type: 'bullet', text: "Venturi meter measures the flow rate (speed) of a fluid; it works on Bernoulli." },
          { type: 'bullet', text: "Reynolds number predicts whether flow is laminar or turbulent (above critical velocity \u2192" },
        ],
      },
      {
        title: "Laminar/streamline flow",
        blocks: [
          { type: 'bullet', text: "In laminar (streamline) flow the velocity at any given point remains constant with time." },
          { type: 'bullet', text: "Adjacent layers in laminar flow slide smoothly past each other." },
          { type: 'bullet', text: "If streamlines are forced closer together the speed of the fluid increases." },
          { type: 'bullet', text: "Two rowboats moving parallel are pulled toward each other (faster water between them drops" },
        ],
      },
    ],
  },
  {
    title: "u6 \u2014 Waves & Oscillations",

    topics: [

      {
        title: "Wave types and definitions (multiple \u00d72\u2013\u00d77)",
        blocks: [
          { type: 'bullet', text: "Transverse wave example: water waves (sound and spring waves are longitudinal/mechanical;" },
          { type: 'bullet', text: "No net transfer of energy by the particles of the medium in a stationary (standing) wave." },
          { type: 'bullet', text: "Longitudinal waves: particles vibrate parallel to the direction of propagation, high\u2011pressure" },
          { type: 'bullet', text: "Distance travelled by a wave during one complete vibration of the source = wavelength;" },
          { type: 'bullet', text: "Wavelength is the distance between two consecutive crests. \u00d72" },
          { type: 'bullet', text: "Number of waves passing a point per unit time = frequency; 1/f = T; v = f\u03bb. \u00d75" },
          { type: 'bullet', text: "Waves per unit time / revolutions per second = frequency." },
          { type: 'bullet', text: "Mechanical waves cannot travel through outer space because there are no particles to transmit" },
          { type: 'bullet', text: "When a wave crosses a boundary between media, its frequency does not change." },
          { type: 'bullet', text: "The three parameters characterising a wave = wavelength, frequency and speed (velocity)." },
        ],
      },
      {
        title: "Simple harmonic motion (SHM) \u2014 recurring core",
        blocks: [
          { type: 'bullet', text: "v = \u03c9\u221a(x\u2080\u00b2 \u2212 x\u00b2); max velocity vmax = \u03c9x\u2080; total energy E = \u00bdkx\u2080\u00b2; \u03c9 = 2\u03c0/T." },
          { type: 'bullet', text: "Acceleration in SHM \u221d displacement, directed toward the mean position (a = \u2212\u03c9\u00b2x). \u00d73" },
          { type: 'bullet', text: "Amplitude is the maximum displacement from the mean position." },
          { type: 'bullet', text: "Velocity is maximum at the mean position; zero at the extremes (there acceleration is" },
          { type: 'bullet', text: "KE is maximum at the mean position, PE maximum at the extremes; total mechanical energy is" },
          { type: 'bullet', text: "Total energy of an oscillator \u221d amplitude\u00b2." },
          { type: 'bullet', text: "Mass\u2011spring period T = 2\u03c0\u221a(m/k); mass \u00d74 \u2192 period doubles; m \u2192 \u00bc \u2192 frequency doubles." },
          { type: 'bullet', text: "Pendulum period T = 2\u03c0\u221a(l/g); length \u00d74 \u2192 frequency halves; length doubled \u2192 frequency" },
          { type: 'bullet', text: "Restoring force of SHM \u221d displacement; pendently restoring force = mg sin\u03b8." },
          { type: 'bullet', text: "Time period is independent of amplitude (for small oscillations)." },
          { type: 'bullet', text: "Graph of acceleration vs displacement in SHM is a straight line. \u00d72" },
          { type: 'bullet', text: "Amplitude doubled \u2192 max velocity doubles." },
          { type: 'bullet', text: "Phase difference between displacement and acceleration of SHM = 180\u00b0." },
          { type: 'bullet', text: "SHM energy depends on the amplitude; at extremes PE is maximum. \u00d72" },
          { type: 'bullet', text: "A body restricted to SHM with A = 0.2 m, \u03c9 = 4 \u2192 vmax = 0.8 m/s." },
          { type: 'bullet', text: "Oscillator 20 vibrations in 10 s \u2192 angular frequency 12.6 rad/s (\u03c9 = 2\u03c0 \u00d7 2)." },
          { type: 'bullet', text: "SHM of period 0.063 s, vmax 3.0 m/s \u2192 x\u2080 = 0.03 m, \u03c9 = 100 rad/s." },
          { type: 'bullet', text: "Pendulum length 9.8 m (g = 9.8) \u2192 frequency = 1/2\u03c0 Hz; T = 6.28 s at g = 10 \u2192 length" },
          { type: 'bullet', text: "Mass\u2011spring with m/k = \u00bc \u2192 period = \u03c0." },
          { type: 'bullet', text: "SHM is oscillation under a restoring force (that is the definition)." },
          { type: 'bullet', text: "The oscilloscope/projection link: the SHM projection of uniform circular motion has angular" },
        ],
      },
      {
        title: "Wave combination \u2014 interference, beats, stationary waves",
        blocks: [
          { type: 'bullet', text: "Destructive interference needs a phase difference of 180\u00b0; for destructive superposition the" },
          { type: 'bullet', text: "Constructive interference needs waves in phase (path difference = whole wavelength)." },
          { type: 'bullet', text: "Two identical waves arriving in phase \u2192 resultant = sum of displacements (double amplitude)." },
          { type: 'bullet', text: "Two waves equal amplitude, out of phase \u2192 resultant = zero (destruction)." },
          { type: 'bullet', text: "Phase difference \u0394\u03c6 = 2\u03c0\u00b7\u0394x/\u03bb; phase \u03c0/2 \u2194 path \u03bb/4." },
          { type: 'bullet', text: "Superposition says resultant amplitude = sum of individual amplitudes." },
          { type: 'bullet', text: "Path difference 100 cm, \u03bb = 50 cm \u2192 constructive \u2192 loudness (100/50 = 2 whole wavelengths)." },
          { type: 'bullet', text: "Path difference = \u03bb gives maximum loudness (constructive)." },
          { type: 'bullet', text: "Stationary waves form from interference of two identical waves travelling in opposite" },
          { type: 'bullet', text: "In a stationary wave energy is trapped between adjacent nodes and is not transported." },
          { type: 'bullet', text: "Antinodes = points of maximum displacement; nodes = points of zero displacement (zero" },
          { type: 'bullet', text: "Phase difference between two particles in the same loop of a stationary wave = 0\u00b0." },
          { type: 'bullet', text: "Distance between consecutive nodes/int antinodes = \u03bb/2; distance node\u2013antinode = \u03bb/4. \u00d72" },
          { type: 'bullet', text: "String in 2 loops over 2 m \u2192 node spacing 1 m." },
          { type: 'bullet', text: "Which does NOT cause a stationary wave: two waves of unequal amplitude." },
          { type: 'bullet', text: "Node spacing for a string fixed at both ends = \u03bb/2; distance between consecutive antinodes" },
          { type: 'bullet', text: "Beats: two waves of 256 Hz and 260 Hz \u2192 beat frequency 4 Hz; beats need nearby" },
          { type: 'bullet', text: "WhMa ray beats: frequencies that can interfere constructively must share a common multiple \u2014" },
          { type: 'bullet', text: "Tuning a radio is an example of electrical resonance; resonance occurs when the driving" },
          { type: 'bullet', text: "Food cooking in a microwave oven is a practical example of resonance." },
          { type: 'bullet', text: "Interference of light needs two coherent sources; interference of sound needs two coherent" },
        ],
      },
      {
        title: "Sound speed and Doppler",
        blocks: [
          { type: 'bullet', text: "Sound speed increases by about 0.61 m/s per 1 \u00b0C rise. \u00d76" },
          { type: 'bullet', text: "Newton assumed isothermal conditions and so underestimated the speed of sound (\u2248280 m/s);" },
          { type: 'bullet', text: "Speed of sound in air is independent of the pressure of the gas (at a given temperature);" },
          { type: 'bullet', text: "Humidity (moist air) makes sound travel FASTER (denser water vapour molecules: lighter" },
          { type: 'bullet', text: "Sound travels fastest in solids (then liquids, slowest in gases); of gases, H\u2082 has the" },
          { type: 'bullet', text: "Frequency has NO effect on the speed of sound." },
          { type: 'bullet', text: "Audible range to humans = 20\u201320000 Hz; ultrasonic waves have frequency > 20 kHz." },
          { type: 'bullet', text: "An object moving faster than sound is supersonic; a plane produces a sonic boom when it" },
          { type: 'bullet', text: "Doppler effect: apparent change in frequency due to relative motion of source and observer;" },
          { type: 'bullet', text: "Source approaching stationary observer \u2192 apparent frequency increases; formula" },
          { type: 'bullet', text: "Source receding from observer \u2192 heard frequency lower; observer moving toward a stationary" },
          { type: 'bullet', text: "Police car approaching \u2192 observed frequency increases." },
          { type: 'bullet', text: "A source moving away \u2192 observed frequency lower than actual." },
          { type: 'bullet', text: "A plane at 0.5v approaching: 200 Hz emitted \u2192 observer hears 400 Hz." },
          { type: 'bullet', text: "Red shift of a galaxy's light means it is receding from Earth \u2192 the universe is expanding." },
          { type: 'bullet', text: "Star line shifted to longer wavelength (589 vs 497 nm) \u2192 moving away from Earth (red shift)." },
        ],
      },
      {
        title: "Resonant pipes and strings (fundamental frequencies)",
        blocks: [
          { type: 'bullet', text: "Stretched string, plucked centre, v = 48 m/s, L = 8 m \u2192 fundamental f = v/2L = 3 Hz. \u00d77" },
          { type: 'bullet', text: "Open pipe fundamental f = v/2L; closed pipe f = v/4L \u2192 open = 2\u00d7 closed. \u00d72" },
          { type: 'bullet', text: "Organ pipe open (A) vs closed (B) same length \u2192 frequency ratio 2:1. \u00d73" },
          { type: 'bullet', text: "Open pipe 0.3 m, v = 330 m/s \u2192 fundamental 550 Hz." },
          { type: 'bullet', text: "Closed pipe echoes: shortest closed pipe resonating at 218 Hz (v=340) \u2192 length L = v/4f \u2248" },
          { type: 'bullet', text: "Closed pipe produces only odd harmonics \u2014 the 2nd harmonic is absent; its 3rd harmonic" },
          { type: 'bullet', text: "Ratio 2nd:3rd overtone of an open pipe = 3/4." },
          { type: 'bullet', text: "A resonating column of air contains stationary longitudinal waves." },
          { type: 'bullet', text: "String clamped 2 m apart: the three longest wavelengths = 4 m, 2 m, 1.33 m." },
          { type: 'bullet', text: "A vibrating string 1 m, tension 40 N, mass 0.1 kg \u2192 wave speed 20 m/s (v = \u221a(T/\u03bc))." },
          { type: 'bullet', text: "Tension increased 4\u00d7 (200 Hz) \u2192 frequency doubles to 400 Hz (f \u221d \u221aT)." },
          { type: 'bullet', text: "The ratio of wavelengths of the 1st, 2nd and 3rd harmonics of a string = 3:2:1 (inverse of" },
        ],
      },
      {
        title: "Sound character / light topics",
        blocks: [
          { type: 'bullet', text: "Loudness is related to the intensity of the wave; loudness increases with amplitude." },
          { type: 'bullet', text: "Echo: distance to a reflecting surface, echo heard 1 s after shout (v=340) \u2192 170 m." },
          { type: 'bullet', text: "Sound waves are NOT polarized in air because they are longitudinal; only transverse waves" },
          { type: 'bullet', text: "Longitudinal waves do not exhibit polarisation." },
          { type: 'bullet', text: "Compression\u2013rarefaction separation = \u03bb/2: a 440 Hz tuning fork (v=340) gives 0.38 m" },
          { type: 'bullet', text: "A wave of \u03bb = 3 m \u2192 centre of a compression to next rarefaction = 1.5 m." },
          { type: 'bullet', text: "In the wave equation y = A sin(kx \u2212 \u03c9t + \u03c6) \u2014 \u03c6 is the phase constant." },
          { type: 'bullet', text: "A wave carries energy (progressive wave transfers energy across the medium even though the" },
          { type: 'bullet', text: "Continuous periodic disturbance = periodic waves." },
          { type: 'bullet', text: "A vibrating body's time period is independent of amplitude." },
        ],
      },
      {
        title: "Light / EM (blended with optics and atomic lines)",
        blocks: [
          { type: 'bullet', text: "Energy of a quantum of radiation \u221d frequency; electron max KE at short wavelength. \u00d72" },
          { type: 'bullet', text: "Red light is chosen for photographic darkrooms because it has less frequency and more" },
          { type: 'bullet', text: "\u03b3\u2011rays have a shorter wavelength than X\u2011rays; \u03b3\u2011radiation arises from de\u2011excitation of the" },
          { type: 'bullet', text: "Planck's constant = 6.63 \u00d7 10\u207b\u00b3\u2074 J s. \u00d72" },
          { type: 'bullet', text: "Lyman series lies in the ultraviolet region; Balmer in visible; Paschen/Brackett/Pfund in" },
          { type: 'bullet', text: "Longest Lyman wavelength = 4/3RH; longest Balmer wavelength = 36/5RH; ratio of longest" },
          { type: 'bullet', text: "Electron dropping 2nd \u2192 1st orbit emits \u03bb = 4RH/3; Bohr's electron orbits are called" },
          { type: 'bullet', text: "Which X\u2011ray photon has the longest wavelength = M\u03b1 (lowest energy transition)." },
          { type: 'bullet', text: "Paschen longest wavelength of the list \u2248 1.87 \u00d7 10\u207b\u2076 m." },
          { type: 'bullet', text: "Light's wave nature is shown by diffraction, interference and polarisation \u2014 NOT by the" },
        ],
      },
    ],
  },
  {
    title: "u7 \u2014 Thermodynamics",

    topics: [

      {
        title: "Processes and the first law",
        blocks: [
          { type: 'bullet', text: "Best condition for a thermodynamic system to do maximum work = isothermal. \u00d712" },
          { type: 'bullet', text: "Isothermal process: temperature stays constant; change in internal energy \u0394U = 0;" },
          { type: 'bullet', text: "Isochoric (constant volume) \u2192 work = 0; isobaric (constant pressure) \u2192 work = P\u0394V." },
          { type: 'bullet', text: "Adiabatic (no heat exchange): Q = 0; Q = 0 in an adiabatic process (value of heat energy" },
          { type: 'bullet', text: "First law: Q = \u0394U + W (energy conservation). \u00d73" },
          { type: 'bullet', text: "During an adiabatic expansion the system doing work has its internal energy decrease;" },
          { type: 'bullet', text: "Boyle's law holds under isothermal conditions; and during an isothermal compression the" },
          { type: 'bullet', text: "A gas expanded 1 m\u00b3 \u2192 3 m\u00b3 at constant pressure 2 Pa does work 4 J (P\u0394V = 2\u00d72)." },
          { type: 'bullet', text: "Isothermal work (initial value relation): work needed is greatest in the adiabatic, then" },
          { type: 'bullet', text: "The adiabatic curve is steeper than the isothermal curve on a P\u2013V diagram. \u00d72" },
          { type: 'bullet', text: "Hess's law states the same as the first law of thermodynamics (state-function enthalpy). \u2192u8" },
          { type: 'bullet', text: "The first law governs \"energy cannot be created or destroyed in a thermodynamic system\"." },
        ],
      },
      {
        title: "Molar heat capacities and specific heats",
        blocks: [
          { type: 'bullet', text: "Cp \u2212 Cv = R for an ideal gas; Cp > Cv because extra heat (R\u0394T) does work at constant" },
          { type: 'bullet', text: "Ratio of specific heats Cv/Cp = \u03b3; for gases this is less than 1." },
          { type: 'bullet', text: "Cv = heat to raise 1 mole by 1 K at constant volume; Cp = heat to raise 1 mole by 1 K at" },
          { type: 'bullet', text: "SI unit of molar specific heat = J mol\u207b\u00b9 K\u207b\u00b9." },
          { type: 'bullet', text: "For an isobaric process Q = nCp\u0394T; heating at constant V (Cv\u0394T = \u0394U)." },
          { type: 'bullet', text: "Raise n moles at constant pressure by \u0394T \u2192 increase in internal energy = n(Cp \u2212 R)\u0394T." },
          { type: 'bullet', text: "Helium in isobaric heating: n moles at constant pressure, the heat supplied Q = nCp\u0394T." },
          { type: 'bullet', text: "Heat required to raise 1 mole of gas by 1 K at constant volume defines Cv." },
        ],
      },
      {
        title: "Entropy and the second law",
        blocks: [
          { type: 'bullet', text: "Second law of thermodynamics is associated with entropy; total entropy of an isolated" },
          { type: 'bullet', text: "Entropy of an isolated system tends to increase (it can't decrease)." },
          { type: 'bullet', text: "Carnot engine efficiency depends only on the temperatures of source and sink (not the working" },
          { type: 'bullet', text: "Carnot cycle consists of both adiabatic and isothermal steps (four stages, two each)." },
          { type: 'bullet', text: "Refrigerator COP = Tc/(Th \u2212 Tc)." },
          { type: 'bullet', text: "A heat engine absorbing 800 J and rejecting 500 J \u2192 efficiency = 37.5% (1 \u2212 500/800)." },
          { type: 'bullet', text: "Heat engine 50% efficient, hot reservoir 327 \u00b0C \u2192 cold reservoir at 27 \u00b0C (keyed: rankine \u2014" },
          { type: 'bullet', text: "Turbine taking heat from 427 \u00b0C and exhausting at 77 \u00b0C \u2192 possible efficiency 50%." },
        ],
      },
      {
        title: "Thermal equilibrium / temperature",
        blocks: [
          { type: 'bullet', text: "Two objects in thermal equilibrium have the same temperature. \u00d72" },
          { type: 'bullet', text: "Zeroth law: two systems each in thermal equilibrium with a third are in thermal equilibrium" },
          { type: 'bullet', text: "Celsius and Fahrenheit give the same reading at \u221240\u00b0." },
          { type: 'bullet', text: "A gas at 150 \u00b0C \u2192 300 \u00b0C in an isobaric process, volume becomes less than double (must" },
          { type: 'bullet', text: "500 g water heated 20\u219240 \u00b0C (c = 4200) needs 42000 J (mc\u0394T = 0.5 \u00d7 4200 \u00d7 20)." },
        ],
      },
      {
        title: "Application examples",
        blocks: [
          { type: 'bullet', text: "The rapid escape of air from a burst tyre is an adiabatic process." },
          { type: 'bullet', text: "Heating a gas in a sealed rigid container is isochoric (constant volume); a gas expanding" },
          { type: 'bullet', text: "Drilling a metal surface makes the drill hot due to work done against friction. \u2192u3" },
          { type: 'bullet', text: "Strain energy of a deformed body is stored as potential energy. \u2192u3" },
        ],
      },
    ],
  },
  {
    title: "u8 \u2014 Electrostatics",

    topics: [

      {
        title: "Fields, potential, units",
        blocks: [
          { type: 'bullet', text: "SI unit of capacitance = farad; relative permittivity has no unit (dimensionless); unit" },
          { type: 'bullet', text: "Unit of charge in base units = ampere\u00b7second (As); 5 \u03bcC = 5 \u00d7 10\u207b\u2076 ampere\u00b7second;" },
          { type: 'bullet', text: "An electric field exists in a region if a test charge placed there experiences a force; the" },
          { type: 'bullet', text: "Coulomb's law: force between two point charges \u221d product of the charges, inversely \u221d the" },
          { type: 'bullet', text: "V = W/q represents electric potential; moving a unit charge between two points at the same" },
          { type: 'bullet', text: "D = Q/A (symbol) represents electric flux density; formula \u03a6 = BA cos\u03b8 is magnetic flux" },
          { type: 'bullet', text: "Electric generators and transformers are based on Faraday's law." },
          { type: 'bullet', text: "A capacitor's energy = \u00bdCV\u00b2; a flash unit at 5 V stores \u00bd\u00b7C\u00b725 (numeric \u2014 work the formula" },
          { type: 'bullet', text: "Capacitor 2 \u03bcF in series with 1 M\u03a9 and 12 V takes \u03c4 = RC = 2 s to reach 63% of its final" },
        ],
      },
      {
        title: "Capacitance arithmetic",
        blocks: [
          { type: 'bullet', text: "Doubling plate area and halving plate separation \u2192 capacitance \u00d74 (C = \u03b5A/d)." },
          { type: 'bullet', text: "Inserting a dielectric between the plates increases the capacitance by the relative permittivity" },
          { type: 'bullet', text: "1 \u03bcF capacitor at 10 V stores 0.05 mJ (\u00bdCV\u00b2)." },
          { type: 'bullet', text: "5 \u03bcF charged to 12 V stores a charge of 60 \u03bcC (Q = CV)." },
          { type: 'bullet', text: "Parallel plate: 2 mm gap, 2 m\u00b2 plates in vacuum \u2192 C = 8.85 \u00d7 10\u207b\u2079 F." },
          { type: 'bullet', text: "Doubling length, width AND separation \u2192 capacitance doubles (A \u00d74, d \u00d72)." },
          { type: 'bullet', text: "In a purely capacitive AC circuit, doubling the capacitance doubles the current (I = V/Xc =" },
          { type: 'bullet', text: "Bodies at the same potential \u2014 no current flows between them when connected (keyed). \u2192u9" },
        ],
      },
      {
        title: "X-ray / electron acceleration (bled from atomic physics)",
        blocks: [
          { type: 'bullet', text: "X-ray minimum wavelength can be reduced by increasing the potential difference between target" },
          { type: 'bullet', text: "KE of the electrons = eV \u2192 KE \u221d V, so V\u2081:V\u2082 = 2:3 gives KE 2:3." },
          { type: 'bullet', text: "Speed of the electron in an X-ray tube v = \u221a(2eV/m). \u00d72" },
          { type: 'bullet', text: "X-ray tube at 20 kV, 20 mA \u2192 \u03bbmin = 6.19 \u00d7 10\u207b\u00b9\u00b9 m." },
          { type: 'bullet', text: "Representative numeric: a body moving along a semi-circular path radius r (from one end of a" },
          { type: 'bullet', text: "Magnetic/B-field line items (direction around a straight conductor, field decreasing away from" },
        ],
      },
    ],
  },
  {
    title: "u9 \u2014 Current Electricity",

    topics: [

      {
        title: "Definitions and units (most \u00d75)",
        blocks: [
          { type: 'bullet', text: "Gradient (slope) of the I\u2013V graph = conductance (I/V = 1/R). \u00d75" },
          { type: 'bullet', text: "60 A for 60 s \u2192 charge = 3.6 \u00d7 10\u00b3 C (Q = It). \u00d75" },
          { type: 'bullet', text: "1 kWh = 3.6 MJ (and = 3.6 \u00d7 10\u2076 J). \u00d75" },
          { type: 'bullet', text: "Negative temperature coefficient of resistance: germanium (a semiconductor); semi-conductors" },
          { type: 'bullet', text: "SI unit of current = ampere; volt \u00d7 ampere = power. \u00d75" },
          { type: 'bullet', text: "Ohm's law: current is directly proportional to voltage as long as the temperature of the" },
          { type: 'bullet', text: "Reciprocal of resistivity = conductivity (\u2192u12)." },
        ],
      },
      {
        title: "Power and internal resistance",
        blocks: [
          { type: 'bullet', text: "Power output of a circuit is maximum when external resistance R = internal resistance r. \u00d74" },
          { type: 'bullet', text: "Efficiency of an emf source = 50% when the load resistance equals the internal resistance." },
          { type: 'bullet', text: "Internal resistance lowers the terminal voltage because it causes power loss inside the" },
          { type: 'bullet', text: "When a battery is being charged, the current inside it flows opposite to the direction of its" },
        ],
      },
      {
        title: "Resistivity / resistance",
        blocks: [
          { type: 'bullet', text: "Doubling the length of a copper wire does NOT change its resistivity (resistivity is an" },
          { type: 'bullet', text: "A positive temperature coefficient means resistance increases with rising temperature." },
          { type: 'bullet', text: "Replacing a resistor with double the resistance (with the same battery) \u2192 current halves" },
        ],
      },
      {
        title: "Networks (resistance between points)",
        blocks: [
          { type: 'bullet', text: "Three 6 \u03a9 resistors in a delta with the third in the odd branch \u2192 equivalent resistance" },
          { type: 'bullet', text: "A 12 \u03a9 wire bent into an equilateral triangle \u2192 resistance between any two corners \u2248 2.7 \u03a9" },
          { type: 'bullet', text: "Thin square film 1 mm\u00b2, 1 \u03bcm thick, \u03c1 = 10\u207b\u2076 \u03a9\u00b7m \u2192 R \u2248 10 \u03a9." },
          { type: 'bullet', text: "The 1 A reading item: required potential difference across a 6 \u03a9 resistor to pass 1 A is" },
        ],
      },
      {
        title: "Electrolysis / electrolytes (bled)",
        blocks: [
          { type: 'bullet', text: "In an electrolytic cell the anode is the positive electrode where oxidation occurs." },
          { type: 'bullet', text: "Acidified water on electrolysis gives both hydrogen and oxygen." },
          { type: 'bullet', text: "Potassium ferrocyanide is a complex salt. \u2192Chem" },
          { type: 'bullet', text: "pBr322 antibiotic-resistance genes (ampicillin & tetracycline) is a biology stray \u2192Bio u13." },
        ],
      },
    ],
  },
  {
    title: "u10 \u2014 Electromagnetism",

    topics: [

      {
        title: "Definitions and units (most \u00d75)",
        blocks: [
          { type: 'bullet', text: "Magnetic flux becomes zero when the angle between B and the vector area is 90\u00b0 (\u03a6 = BA cos\u03b8)." },
          { type: 'bullet', text: "Rate of change of magnetic flux is measured in volts (that is the induced emf). \u00d75" },
          { type: 'bullet', text: "Weber is the SI unit of magnetic flux \u2014 1 Wb = 1 volt\u00b7second = 1 joule per ampere; magnetic" },
          { type: 'bullet', text: "Tesla is the SI unit of magnetic field intensity \u2014 1 T = N A\u207b\u00b9 m\u207b\u00b9; magnetic field strength" },
          { type: 'bullet', text: "Magnetic flux density (unit) = Wb m\u207b\u00b2." },
          { type: 'bullet', text: "The induced current flows so as to oppose the cause that produces it \u2014 this is Lenz's law." },
        ],
      },
      {
        title: "Forces, motion of charged particles",
        blocks: [
          { type: 'bullet', text: "Force on a conductor, with angle changed to 45\u00b0 \u2192 F/\u221a2 (F sin45\u00b0). \u00d72" },
          { type: 'bullet', text: "A neutron entering a magnetic field perpendicular to its velocity is undeflected \u2014 it moves" },
          { type: 'bullet', text: "A charged particle entering a magnetic field parallel to it moves in a straight line" },
          { type: 'bullet', text: "\u03b1 parities deviate less than \u03b2 in a field because the \u03b1 particle is heavier." },
          { type: 'bullet', text: "Why do two electrons in the same orbital spin oppositely \u2014 this condition results in less" },
        ],
      },
      {
        title: "Solenoids and field patterns",
        blocks: [
          { type: 'bullet', text: "Doubling the number of turns of a solenoid/circular coil (same current and radius) doubles the" },
          { type: 'bullet', text: "Cutting a solenoid in half reduces the magnetic induction to half (fewer turns)." },
          { type: 'bullet', text: "A solenoid of 10 cm, 100 turns, 1 \u03bcA \u2192 B = 4\u03c0 \u00d7 10\u207b\u00b9\u2070 tesla (B = \u03bc\u2080nI)." },
          { type: 'bullet', text: "Inserting an iron core into a solenoid strengthening its field pulls a nearby small magnet" },
          { type: 'bullet', text: "Two parallel wires carrying equal and opposite currents \u2014 field strength around them varies" },
          { type: 'bullet', text: "Direction of B-field lines around a straight current-carrying conductor: clockwise when viewed" },
        ],
      },
      {
        title: "CRO & practicals",
        blocks: [
          { type: 'bullet', text: "The electron gun of a cathode-ray oscilloscope contains filament, cathode, grid and anode." },
          { type: 'bullet', text: "Electron-volt is the unit of energy (\u2192u8)." },
        ],
      },
    ],
  },
  {
    title: "u11 \u2014 Electromagnetic Induction",

    topics: [

      {
        title: '',
        blocks: [
          { type: 'bullet', text: "Step-up transformer, turns ratio 5, primary 20 A at 220 V \u2192 secondary voltage = 1100 V." },
          { type: 'bullet', text: "Coil of 100 turns, flux 20 mWb reversed in 2 ms \u2192 induced emf = 2000 V (\u03b5 = N\u0394\u03a6/\u0394t)." },
          { type: 'bullet', text: "Lenz's law is in accordance with the law of conservation of energy. \u00d75" },
          { type: 'bullet', text: "If the rate of change of current in the primary is increased by 1.5\u00d7, the emf induced in the" },
          { type: 'bullet', text: "In a step-up transformer if secondary voltage is increased \u00d710, the secondary current is 1/10" },
          { type: 'bullet', text: "Internal resistance reduces terminal voltage because it causes power loss inside the battery" },
          { type: 'bullet', text: "In an AC generator the emf is maximum when sin\u03c9t = 1." },
        ],
      },
    ],
  },
  {
    title: "u12 \u2014 Alternating Current",

    topics: [

      {
        title: '',
        blocks: [
          { type: 'bullet', text: "An alternating-current generator converts mechanical energy into electrical energy. \u00d74" },
          { type: 'bullet', text: "Visible region of the electromagnetic spectrum = 400\u2013700 nm." },
          { type: 'bullet', text: "Which statement about X-rays is INCORRECT \u2014 \"they have higher wavelength than visible light\"" },
          { type: 'bullet', text: "Accelerating electromagnetic charges radiate waves that propagate at the speed of light;" },
          { type: 'bullet', text: "Reciprocal of resistivity of a material = conductivity." },
          { type: 'bullet', text: "In a purely capacitive AC circuit, doubling capacitance doubles the current (\u2192u8)." },
        ],
      },
    ],
  },
  {
    title: "u13 \u2014 Electronics",

    topics: [

      {
        title: "Diodes and rectification (most \u00d75)",
        blocks: [
          { type: 'bullet', text: "A diode is a semiconductor device used for rectification; AC \u2192 DC conversion (rectification)" },
          { type: 'bullet', text: "Full-wave rectification is given by four diodes connected in a bridge arrangement." },
          { type: 'bullet', text: "The depletion region of a PN junction has no free charges \u2014 only positive and negative ions." },
          { type: 'bullet', text: "A diode characteristic curve is a plot of voltage against current (V\u2013I)." },
          { type: 'bullet', text: "Photodiode generates an output voltage when placed in light." },
          { type: 'bullet', text: "The circuit required to change AC to DC is called a rectifier." },
          { type: 'bullet', text: "Diode rectifier I\u2013V curve (figure item \u2014 the standard one-sided conduction curve)." },
        ],
      },
      {
        title: "Logic gates",
        blocks: [
          { type: 'bullet', text: "NAND gate Boolean expression: X = (A\u00b7B) with a bar over the whole (the correct option is" },
          { type: 'bullet', text: "Connecting three NAND gates forms an AND (or OR/NOR depending on arrangement) gate \u2014 figure" },
          { type: 'bullet', text: "Output table x = AB + A\u0305B\u0305 (XNOR) \u2014 truth table item; the \"YES\" operation is not one of" },
          { type: 'bullet', text: "The sequence of fundamental logic gates: figure items \u2014 compute the Boolean expression and" },
          { type: 'bullet', text: "For the logic-diagram Boolean-expression items, work the truth table row by row (0,0 \u2192 1; 0,1 \u2192" },
        ],
      },
      {
        title: "Optics / human eye (bled)",
        blocks: [
          { type: 'bullet', text: "Near point (least distance of distinct vision) of a normal human eye = 25 cm; the near" },
          { type: 'bullet', text: "In normal adjustment of a compound microscope the final image is formed at infinity." },
          { type: 'bullet', text: "Information is transmitted very safely and easily by optical fibre." },
          { type: 'bullet', text: "CAT in X-ray technology = Computerized Axial Tomography." },
          { type: 'bullet', text: "A laser/optical application: plane polarised light measures sugar concentration (\u2192u6)." },
        ],
      },
      {
        title: "Efflux (Torricelli bled items)",
        blocks: [
          { type: 'bullet', text: "Efflux speed 9.8 m/s through a hole \u2192 height of fluid above the hole = 4.9 m (v = \u221a2gh)." },
          { type: 'bullet', text: "Hole in a 2 m cylinder: efflux is maximum from the lowest hole (0.3 m) because the water" },
          { type: 'bullet', text: "20 m tank, hole at the middle (height 10 m above the base) \u2192 efflux speed 14 m/s." },
        ],
      },
      {
        title: "Systems / electrolysis (stray)",
        blocks: [
          { type: 'bullet', text: "An open system allows the transfer of both mass and energy." },
          { type: 'bullet', text: "Plasma constitutes about 55% of blood by volume (\u2192Bio)." },
          { type: 'bullet', text: "English/Logical-Reasoning strays (parody uses exaggerated language to entertain and mock; syllogism" },
        ],
      },
    ],
  },
  {
    title: "u14 \u2014 Dawn of Modern Physics",

    topics: [

      {
        title: "Photoelectric / photon energy",
        blocks: [
          { type: 'bullet', text: "Planck's constant h = 6.6262 \u00d7 10\u207b\u00b3\u2074 J\u00b7s." },
          { type: 'bullet', text: "The photon with the most energy in the visible spectrum is violet (E = hf; violet has the highest frequency)." },
          { type: 'bullet', text: "X-rays consist of high-energy photons (they are electromagnetic radiation, not particles or protons)." },
        ],
      },
      {
        title: "Compton effect",
        blocks: [
          { type: 'bullet', text: "Compton shift depends most strongly on the scattering angle of the photon (not on electron spin or photon energy directly)." },
          { type: 'bullet', text: "Maximum Compton shift occurs at a scattering angle of 180\u00b0 (full backscattering)." },
        ],
      },
      {
        title: "Subatomic particles",
        blocks: [
          { type: 'bullet', text: "Particles with mass less than protons are mesons (e.g. pion \u2248 0.15 \u00d7 proton mass)." },
          { type: 'bullet', text: "Beta-minus (\u03b2\u207b) decay: a neutron converts into a proton (n \u2192 p + e\u207b + \u03bd\u0304e); the atomic number Z increases by 1 while the mass number A is unchanged." },
        ],
      },
    ],
  },
  {
    title: "u15 \u2014 Atomic Spectra",

    topics: [

      {
        title: "Bohr atom / energy levels",
        blocks: [
          { type: 'bullet', text: "Ground state corresponds to minimum energy." },
          { type: 'bullet', text: "The potential to accelerate an electron from its ground state to a higher state is called excitation potential (distinguished from ionisation potential, which fully removes the electron)." },
          { type: 'bullet', text: "Hydrogen-atom radius in the 2nd orbit is four times the ground-state radius (r_n = n\u00b2r\u2081)." },
          { type: 'bullet', text: "Hydrogen emission spectrum: several discrete series of lines whose intensity and spacing decrease as wavenumber increases within each series (Lyman \u2192 UV, Balmer \u2192 visible, Paschen \u2192 IR)." },
          { type: 'bullet', text: "Protons and neutrons are located in the nucleus." },
          { type: 'bullet', text: "Wavelength emitted in an atomic transition between states Ei and Eo = hc/(Ei \u2212 Eo)." },
        ],
      },
      {
        title: "Atomic configurations / unpaired electrons",
        blocks: [
          { type: 'bullet', text: "Boron has 1 unpaired electron in its ground state (1s\u00b22s\u00b22p\u00b9 \u2192 one unpaired 2p electron)." },
          { type: 'bullet', text: "Fe\u00b3\u207a (Z = 26, 5 electrons removed: 3d\u2075) has 5 unpaired electrons." },
          { type: 'bullet', text: "An element with four unpaired electrons in its ground state has proton number 26 (iron) \u2014 [Ar] 3d\u2076 has four unpaired." },
        ],
      },
      {
        title: "Lasers",
        blocks: [
          { type: 'bullet', text: "LASER = Light Amplification by Stimulated Emission of Radiation." },
          { type: 'bullet', text: "Laser light is coherent and monochromatic." },
          { type: 'bullet', text: "Population inversion in a He\u2013Ne laser is achieved in the neon atoms (helium acts as the pumping partner)." },
          { type: 'bullet', text: "Population inversion is created by optical pumping." },
          { type: 'bullet', text: "In stimulated emission, the two photons produced have identical wavelength (\u03bbA = \u03bbB)." },
          { type: 'bullet', text: "The active (lasing) gas in a He\u2013Ne laser tube is neon; CO\u2082 is the active medium in high-power IR lasers." },
          { type: 'bullet', text: "Helium\u2013neon lasers are used for precise range-finding." },
          { type: 'bullet', text: "Generating a 3D image of an object using a laser beam is called holography." },
        ],
      },
      {
        title: "X-rays",
        blocks: [
          { type: 'bullet', text: "The target in an X-ray tube must have a high atomic number (tungsten is the standard target material)." },
          { type: 'bullet', text: "The continuous X-ray spectrum is produced by bremsstrahlung (braking radiation)." },
          { type: 'bullet', text: "X-ray spectrum shows a continuous background with characteristic superimposed lines." },
          { type: 'bullet', text: "K\u03b2 photon energy = EM \u2212 EK (electron falls from the M shell to the K shell; the K\u03b1 line is the L\u2192K transition)." },
          { type: 'bullet', text: "Minimum wavelength \u03bbmin of an X-ray tube = hc/eV; every emitted wavelength is not less than (\u2265) \u03bbmin." },
        ],
      },
    ],
  },
  {
    title: "u16 \u2014 Nuclear Physics",

    topics: [

      {
        title: "Radioactivity definitions (highest-weight x5 items)",
        blocks: [
          { type: 'bullet', text: "1 becquerel (Bq) = 1 nuclear decay per second (SI unit of activity). \u00d75" },
          { type: 'bullet', text: "T\u2081/\u2082 of Iodine-131 is 8 days; Iodine-131 is used to treat thyroid cancer. \u00d75" },
          { type: 'bullet', text: "\u03bb = 0.693 / T\u2081/\u2082 (decay constant\u2013half-life relation); if T\u2081/\u2082 = 0.693 yr then \u03bb = 1 yr\u207b\u00b9. \u00d75" },
          { type: 'bullet', text: "Thyroid cancer treated with Iodine-131 (not Co-60, which is used for external beam radiotherapy). \u00d75" },
        ],
      },
      {
        title: "Alpha, beta, gamma decay",
        blocks: [
          { type: 'bullet', text: "\u03b1 decay: mass number A drops by 4, atomic number Z drops by 2 (emits \u2074\u2082He). \u00d75" },
          { type: 'bullet', text: "\u03b2\u207b decay: Z increases by 1, A unchanged (neutron \u2192 proton); parent and daughter from \u03b2\u207b decay are isobars (same A). \u00d75" },
          { type: 'bullet', text: "\u03b3 rays have the least ionizing ability of \u03b1, \u03b2 and \u03b3; \u03b1 has the greatest ionizing power." },
          { type: 'bullet', text: "\u03b1-particle charge = +2e (and mass \u2248 4 u)." },
          { type: 'bullet', text: "After emitting 1\u03b1 and 2\u03b2\u207b, A drops by 4 and Z is unchanged (\u22122 +1 +1)." },
          { type: 'bullet', text: "After emitting one \u03b1, one \u03b2 and one \u03b3, the nucleon number decreases by 4 (only \u03b1 changes A)." },
          { type: 'bullet', text: "Ra226 \u2192 Rn222 + \u03b1 (mass number: 226 \u2212 4 = 222; Z: 88 \u2212 2 = 86)." },
          { type: 'bullet', text: "The nucleon number A decreases by 4 in \u03b1 decay and by 0 in \u03b2 decay." },
          { type: 'bullet', text: "Of \u03b3 decay, neutron emission and \u03b2 decay, only beta decay changes the atomic number (\u03b3: neither A nor Z changes)." },
          { type: 'bullet', text: "\u03b2\u207b track in a Wilson cloud chamber: thin and irregular/curved (vs \u03b1: thick, short, straight; \u03b3: faint, long)." },
          { type: 'bullet', text: "A photon of gamma radiation has more energy than an X-ray photon of the typical tube spectra (both move at c)." },
          { type: 'bullet', text: "Electronic (orbital) transitions emit from infrared up to X-rays \u2014 they cannot emit gamma rays (\u03b3 rays come from the nucleus)." },
        ],
      },
      {
        title: "Absorbed dose and units",
        blocks: [
          { type: 'bullet', text: "Gray (Gy): unit of absorbed dose = 1 joule per kilogram. \u00d75" },
          { type: 'bullet', text: "To double the absorbed dose in gray, the absorbed energy must be doubled (dose = energy/mass)." },
          { type: 'bullet', text: "10 J absorbed by a 10 g mass \u2192 absorbed dose = 1000 gray (10 J \u00f7 0.01 kg)." },
          { type: 'bullet', text: "Becquerel: SI unit of activity; curie = 3.7 \u00d7 10\u00b9\u2070 Bq (old unit)." },
          { type: 'bullet', text: "Unit of decay constant \u03bb = s\u207b\u00b9 (per second)." },
          { type: 'bullet', text: "Roentgen measures ionising ability; sievert measures biological effective dose." },
          { type: 'bullet', text: "Rad is a unit of absorbed dose (100 rad = 1 Gy)." },
        ],
      },
      {
        title: "Half-life numerics",
        blocks: [
          { type: 'bullet', text: "Na-24 half-life = 15 hours; used to estimate plasma blood volume. \u00d75" },
          { type: 'bullet', text: "Th-234: 8 kg after 72 days (T\u2081/\u2082 = 24 d) \u2192 1 kg (3 half-lives: 8\u21924\u21922\u21921)." },
          { type: 'bullet', text: "Na-24 after 4 half-lives (60 h) \u2192 6.25% remaining." },
          { type: 'bullet', text: "C-14 T\u2081/\u2082 = 5730 yr; after 11460 yr \u2192 1/4 remains (2 half-lives)." },
          { type: 'bullet', text: "I-131 T\u2081/\u2082 = 8 d; after 24 d \u2192 5 g (40\u219220\u219210\u21925, 3 half-lives)." },
          { type: 'bullet', text: "Count rate 240 \u2192 30 in 60 min \u2192 T\u2081/\u2082 = 20 min (240/30 = 8 = 2\u00b3; 3 half-lives in 60 min)." },
          { type: 'bullet', text: "N\u2082O\u2085 T\u2081/\u2082 = 24 min; 25% left after 48 min (2 half-lives)." },
          { type: 'bullet', text: "Cobalt-50 T\u2081/\u2082 = 4.3 yr; 1/32 remains after 21.5 yr (5 half-lives)." },
          { type: 'bullet', text: "1/8 remaining after 1 hr \u2192 T\u2081/\u2082 = 20 min (3 half-lives)." },
          { type: 'bullet', text: "25% remaining means 2 half-lives have elapsed (100%\u219250%\u219225%)." },
          { type: 'bullet', text: "\"half-life is directly proportional to decay constant\" is false \u2014 it is inversely proportional." },
        ],
      },
      {
        title: "Decay law and probability",
        blocks: [
          { type: 'bullet', text: "Rate of radioactive decay = \u2212\u03bbN (N = number of undecayed nuclei at time t)." },
          { type: 'bullet', text: "Activity (rate of decay) depends on the number of atoms N present; half-life does not." },
          { type: 'bullet', text: "Decay constant \u03bb is the probability that a given nucleus decays in unit time; \u03bb is independent of the age of the atom." },
          { type: 'bullet', text: "Greater decay constant \u2192 greater activity (activity = \u03bbN)." },
          { type: 'bullet', text: "The ratio of decay rate to number of nuclei present = decay constant." },
        ],
      },
      {
        title: "Isotopes and nuclear structure",
        blocks: [
          { type: 'bullet', text: "Isotopes: same number of protons, different numbers of neutrons." },
          { type: 'bullet', text: "Atomic number is determined by the number of protons." },
          { type: 'bullet', text: "Top quark charge = +\u2154 e; three quarks make up a baryon; mesons = quark + antiquark pair." },
        ],
      },
      {
        title: "Radioisotope applications",
        blocks: [
          { type: 'bullet', text: "Cobalt-60 used for external radiotherapy; Iodine-131 for thyroid cancer." },
          { type: 'bullet', text: "Phosphorus-32 used for blood-circulation studies (but Na-24 for plasma blood volume)." },
          { type: 'bullet', text: "Proton mass \u2248 1836 \u00d7 electron mass." },
        ],
      },
      {
        title: "Nuclear reaction balance",
        blocks: [
          { type: 'bullet', text: "In \u2079\u2084Be + \u2074\u2082He \u2192 \u2076\u2086Ca + \u00b9\u2080n: balancing nucleons \u2192 A = 12 (Be9 + He4 = 13; 13 \u2212 1 = 12); this is actually \u2076\u2081\u2082C (carbon-12)." },
        ],
      },
      {
        title: "Bled / misclassified strays (noted for coverage audit)",
        blocks: [
          { type: 'bullet', text: "Chemical reaction (2Na + Cl\u2082 \u2192 2NaCl with 4 mol Na + 2 mol Cl\u2082 \u2192 0 mol Cl\u2082 remains), gas laws (P doubled at constant T \u2192 density increases; T,V doubled \u2192 pressure unchanged), common-ion effect (HCl added to brine \u2192 NaCl solubility decreases), thermodynamics (isothermal/adiabatic processes), mechanical (centripetal force doubles with mass), cytosol (Bio), English comprehension \u2014 these sit in u16 only because the source papers mixed questions on the same page." },
        ],
      },
    ],
  },
]