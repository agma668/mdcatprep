# Physics — MDCAT 2026 master notes

Every distinct Physics MCQ in the corpus, as one fact line. **776 fact buckets** built from
**1,054 parsed questions** across 25 papers and mocks. `×n` marks how many corpus questions ask
that fact — anything marked `×3` or more is a near-certain repeat. No explanations by design.

Facts are grouped by sub-topic inside each unit; a few sit in a unit because that is where the
paper put them (some pages of the scanned papers bleed the wrong subject in), so the handful of
cross-subject strays are tagged `→X`. Coverage is auditable via `../Analysis/notes_buckets.json`.

---

## u1 — Vectors & Equilibrium

**Vectors and their products**
- **Dot product of two unit vectors = cosθ**; the **dot product of a vector with itself = A²**
 (its magnitude squared).
- If a **dot product is negative** and one vector lies along the +x-axis, the **projection of the
 second vector is along −x**.
- **Vector product of two vectors** (cross product) gives a **magnitude and a unit vector**; the
 result is a vector (has magnitude and direction).
- **Vector product magnitude = √3 × scalar product** ⇒ tanθ = √3 ⇒ **angle = 60°**.
- **Dot product of A (4,3,2) · B (1,5,2) = 4 + 15 + 4 = 23**.
- **A = 2i+3j, B = −6i+4j**: dot = −12+12 = **0 ⇒ angle = 90°**.
- A **particle moving in a circle describing equal angles in equal times** has velocity that
 **changes only in direction** (speed constant).
- **Kinetic energy** is a **dot (scalar) product** of vectors (½mv²).
- **Quantity of motion due to mass and velocity = momentum**.
- **The right-hand rule gives the direction of angular velocity** (and angular displacement). ×2
- On a **3‑D Cartesian** system the components given let you build dot products directly from
 "sum of corresponding products".

**Torque and equilibrium**
- A **couple = two forces equal and opposite, not collinear**: it gives **no net force but a net
 torque**, and the **torque of a couple is independent of the location of origin**. ×2
- **Doubling the moment arm doubles the torque** (τ = F·ℓ).
- Moment of a force **F acting at angle θ to the vertical on a bar of length L = LF sinθ**.
- **Forces 5 N and 10 N** at equilibrium on a uniform metre rod suspended at the 50 cm mark — the
 position of the 10 N force balances moments (figure item — work moments about the pivot).
- A **stream of air blown under one pan** of a physical balance makes that **pan go up**.

**Vector–scalar identification**
- Which is a **vector quantity** — keyed **electric flux** (per the official key).
- Angular displacement behaves as a **vector only for very small rotations**. →u4

**Cross-subject strays bucketed into u1 (chemistry equilibrium)**
- Buffer/equilibrium items (ammonium hydroxide–ammonium chloride buffer, BiCl₃ + H₂O cloudy
 balance, direction of a forward reaction, effect of pressure, N₂O₄ ⇌ 2NO₂, 5 cal = 20.92 J) are
 chemistry facts that a scanned paper mis-bucketed here; they are covered in Chemistry u6.

---

## u2 — Force & Motion

**Graphs and defined quantities (all ×5)**
- **Acceleration = the gradient (slope) of the velocity–time graph**. ×5
- **Rate of change of linear momentum = force**. ×5
- If the **slope of the velocity–time graph gradually decreases**, the body moves with
 **negative acceleration** (retardation).
- **Area under a velocity–time graph = displacement (distance covered)**.
- A **displacement–time straight line at 45° means constant velocity** (v = slope).

**Momentum, collisions, impulse**
- **Quantity of motion of a body is measured by momentum**. ×5
- Two bodies with **KE ratio 4:1 and equal momentum** have **masses in ratio 1:4** (KE = p²/2m).
- **Rate of change of momentum = force**; the momentum of a body is changed by an **impulse**.
- In a **1‑D elastic collision of two equal masses, one at rest → velocities are interchanged**.
 ×5
- **In an elastic collision total kinetic energy before and after remains the same**. ×2
- A **rolling cart collides with a stationary equal-mass cart and they stick**: momentum is
 conserved because **no external force acts on the system**.
- Two bodies that collide and **stick (inelastic)**: only **momentum** is conserved.
- **Relative speed of approach in an elastic collision = relative speed of separation** (equal
 mass 2 kg @5 m/s + 3 kg @1 m/s → 4 m/s out).
- **Canon recoil** happens due to **Newton's third law of motion**. ×3
- **Bullet 20 g at 100 m/s from an 8 kg rifle → recoil velocity 0.25 m/s** (momentum conserved).
- **Water out at 3 kg/s, velocity changing 5→0 on a wall → force = 15 N**.

**Projectiles**
- **Range is maximum when sin2θ = 1** (θ = 45°).
- **Angle giving ¼ of the maximum height is 30°** (sin²θ = ¼). ×5
- **Universal 2‑D motion under constant g is called projectile motion**.
- **At maximum height the projectile's velocity is minimum but not zero** (only the vertical
 component vanishes); projectile **velocity is maximum at the point of projection**.
- **Horizontal component of velocity stays constant** throughout (no air resistance). ×2
- **Projectile with time of flight 8 s**: total vertical displacement on landing = **0** (returns
 to its launch level).
- A ball thrown **vertically up at 20 m/s returns to its starting height at −20 m/s** (same speed,
 opposite direction).

**Circular/rotational basics (cross-topic with u2)**
- **Uniform circular motion: velocity ⊥ acceleration**, acceleration points to centre. ×2
- Object moving in a circle with constant speed → **force acting toward the centre**.
- **Travel once around a circle at constant speed**: displacement is zero, but average speed NOT
 zero and acceleration NOT zero → **statement I only**.
- **Vertical-circle minimum velocity at the highest point = √(gr)**.
- **Second hand 1 cm long → tip speed = 2π/60 cm/s** (v = ωr, ω = 2π/60).
- **Every particle of a rotating disc has constant angular velocity**.
- **Disc, hoop and sphere of equal mass/radius rolling down** — the **sphere reaches the ground
 first (greatest speed)** because it stores the least rotational KE.
- **Angular momentum plays in rotation the role linear momentum plays in translation**.
- **A particle doing a full revolution has displacement zero**.
- **Motorcyclist on a circular track at constant speed keeps constant angular velocity**.

**Elevator/weight apparent weight**
- Elevator **moving up at constant velocity** → apparent weight = **mg** (no change).
- Elevator **ascending with acceleration** → apparent weight **increased**.
- Elevator **accelerating downward** (a = g) → apparent weight **zero (weightless)**. ×2
- **1 kg on a balance in an elevator accelerating down at 4 m/s² → reading 5.8 N** (m(g−a)).

**SHM and simple harmonic motion**
- SHM with **time period 10 s → a = −(2π/10)² x**. ×2
- In SHM the **phase difference between displacement and acceleration = 180°**.
- **Velocity of a body in SHM = ω√(x₀² − x²)**. ×3
- **Amplitude doubled → maximum velocity doubles** (vmax = ωx₀).
- **Graph of acceleration vs displacement in SHM is a straight line** (through origin, negative
 slope).
- **Velocity in SHM is maximum at the mean position**; at an **extreme position velocity is zero
 and acceleration is maximum**. ×2
- SHM **total mechanical energy does not vary with time**.
- **Resultant displacement of two superposed waves = y₁ + y₂** (superposition). →u6

**Fluid flow & terminal velocity (u2 misfiled fluid items)**
- **Blood vessel narrows → velocity increases, pressure decreases**.
- Pipe **0.02 m² at 3 m/s narrowing to 0.01 m² → velocity 6 m/s** (never crosses continuity).
- **Bernoulli: blood pressure drops when velocity increases in a narrow vessel**.
- **Speed of gas molecules vs temperature: v = √(3RT/M)** (rms speed).
- **In circular motion, with angular displacement constant, decreasing the radius decreases linear
 displacement** (s = rθ). ×2
- **A car at 36 km/h doubling speed in 10 s, wheel radius 25 cm → ~135 revolutions** (figure
 numeric).
- **Maximum constant velocity through a fluid = terminal velocity** → u5.

**Waves and sound (misfiled)**
- If **20 waves pass in 1 s at 20 m/s** → **wavelength = 1 m**. →u6
- **1/f = T**; **velocity of sound in air is independent of pressure**; speed of sound **in vacuum
 is not defined**; **54 waves/min with λ = 10 m → v = 9 m/s**. →u6
- **Frequency of oscillation m/k = ¼ → period = π** (T = 2π√(m/k)). →u6
- **Any displacement due to two waves y₁ and y₂ → resultant y = y₁ + y₂**. →u6

**Electron orbit velocity**
- Electron in **1st hydrogen orbit at 2.18×10⁶ m/s**: velocity in the **3rd orbit = 0.73×10⁶ m/s**
 (v ∝ 1/n).

---

## u3 — Work & Energy

**Work, power, engines (all ×5 where marked)**
- **In an isochoric (constant‑volume) process the work done by the gas = zero**. ×5
- **In the British system, 1000 hp = 746000 watts** (1 hp = 746 W). ×5
- **KE becomes 4× ⇒ momentum becomes 2×** (p ∝ √KE). ×5
- **Man pulls 50 m with 100 N at 60° → work = 2500 J** (F·d·cos60°). ×5
- **SI unit of power** = watt; base unit set **kg m² s⁻³ measures power**.
- **A 1 N force displacing its point of application 1 m in its own direction does 1 J of work**.
- **Man pushes a wall with 100 N for 10 s → work = zero** (no displacement). ×2
- **Holding a bag / pushing a wall** is a case of **zero work** (no displacement of application
 point). ×2
- **Gravitational work lifting weight w through height h = −wh** (force opposes motion).
- **Work by gravity on a body moving horizontally = 0**; a **girl carrying a 3 kg bag over 200 m
 level road does zero work against gravity**.
- **Work done on a satellite by Earth's gravity is zero** (force ⊥ displacement).
- **Work by gravity on a body on a smooth horizontal surface = 0**.
- **0.5 kg ball at 6 m/s → KE = 9 J** (½mv²).
- **KE = p²/2m**; doubling velocity quadruples KE.
- **Power output of a motor lifting 2 N through 100 cm in 4 s = 0.5 W**.
- **In an ideal transformer power input = power output**. ×2
- **Increasing current in power‑transmission lines increases heat produced in the wires**.

**First law & thermodynamic processes**
- **Gas expanding against constant pressure P from V₁ to V₂ does work = P(V₂ − V₁)**. ×3
- **Isobaric process → work done = PΔV**.
- **Isothermal expansion of an ideal gas doing 200 J of work absorbs 200 J of heat** (ΔU = 0).
- **Adiabatic expansion → work done by the gas is positive** (temperature and internal energy
 fall; no heat exchange). ×3
- **Compressing a gas 4 L → 2 L at 2 kPa does work −4 J**.
- **Area under a P–V graph = work done** by/on the gas. ×2
- **The SI unit of thermodynamic work = joule**.
- In the P–V cycle **A→B→C (work 30 J, heat in 40 J) → ΔU = 10 J** (Q = W + ΔU).
- **Work in the ABCA cycle** at (P,V),(3P,3V),(P,3V) = **2PV** (area of the rectangle).
- **Heat flow between hot/cold bodies continues until all molecules have equal average translational
 kinetic energy**.
- **For an ideal gas the molecular potential energy = zero**.
- **Heating an ideal gas in a fixed cylinder (isochoric) raises the kinetic energy of the
 molecules** (temperature rises).
- **Real gases cannot reach absolute zero in practice because intermolecular forces exceed the
 kinetic energy** (they condense/liquefy first).
- An **increase in internal energy can do everything EXCEPT "raise temperature by dropping the
 kinetic energy"** ("a rise in temperature due to a drop in kinetic energy" is the one not caused).
- **The process in which all supplied heat converts to work = isothermal** (Q = W, ΔU = 0).
- **First law of thermodynamics: energy cannot be created or destroyed** — conservation of energy.

**Kinetic theory / pressure / states**
- **SI unit of pressure = pascal**.
- **Renewable energy source of the list = solar energy** (coal, natural gas, petroleum are not).
- Marble chips + dilute HCl gas evolution → gas expands, so **work is done by the system** (w
 negative) with **heat released** (q positive).

**Radiation ionisation**
- Nuclear radiation: **least penetrating = greatest ionising; greatest penetrating = least
 ionising** → statements I **and** II are both correct.
- **Maximum ionising power = α‑rays**; **greatest penetrating power = γ‑rays**. ×2

**SHM energy**
- **Potential energy per unit volume = ρgh**; gravitational PE at height h = **mgh** (below
 reference, e.g. a diver at depth h, it is **−mgh** keyed). ×2
- **Strain energy in a deformed body is stored as potential (elastic) energy**.
- **KE of a mass‑spring oscillator at displacement x = ½kx₀²(1 − x²/x₀²)**.
- **Ratio of KE to total energy of an SHO = 1 − x²/x₀²**.
- **KE = PE when x = x₀/√2**; **KE = 2×PE when x = x₀/√3**.
- **At the extreme positions of SHM the potential energy is maximum**. ×2
- **Electron has maximum KE when it has short wavelength** (E = hc/λ).

**Misc / bled**
- **Magnifying power M = 1 + d/f (f = 5 cm, d = 25 cm) → M = 6**. →u13
- **KE with which an electron strikes the X‑ray target = eV**. →u15
- Photo-electric KE is controlled by **frequency** — this keyed item is recorded under u6
 (wave/particle).
- Corrections to the corpus: the S.I.‑unit of pressure (pascal) and the renewable‑source item are
 thermodynamics-of-matter facts placed here by the compilation.

---

## u4 — Rotational & Circular Motion

**Angles, radians, degrees (most ×3–×7)**
- **1 degree = π/180 rad**; **π radians = 180°**; **one complete rotation = 2π rad**; half a
 revolution = **π rad**. ×3
- **Angle subtended by an arc equal to twice the radius = 2 radians**; an arc equal to **1/60° is
 one minute of arc**; an arc equal to the radius = **one radian**.
- **Three turns (or revolutions) = 3 × 2π = 18.8 rad**; a wheel of 3 revolutions → **6π rad**;
 **5π rad = 2.5 revolutions**; two revolutions → **4π** rad.
- **Angular displacement θ = s/r**; arc length **s = rθ**; linear & angular accl **a = rα**;
 angular velocity **ω = l/rt**. ×4
- **Radius 4 m, arc 14 m → θ = 3.5 rad**; point on wheel rotating **180° (r = 1 m) → linear
 displacement 3.14 m**.
- **12 revolutions in 4 s → average angular velocity = 3 rev/s (or 6π ≈ 18.8 rad/s)**. ×7
- **Motor at 400 rpm → ω = 40π/3 rad/s**; **electric motor 400 rev/min → 40π/3 rad/s**.
- **Aircraft turning radius 100 m at 250 m/s → ω = 2.5 rad/s**.
- **Wheel radius 0.4 m with α = 6 rad/s² → linear acceleration 2.4 m/s²**.
- **Flywheel 0 → 40 rad/s in 8 s → angular displacement 160 rad**.
- **Disk starts from rest, α = 4 rad/s², after 3 s → ω = 12 rad/s**.
- **Linear velocity doubled at same radius → angular velocity doubles** (ω = v/r).
- **Particle on radius 100 mm at 10 cm/s → ω = 1 rad/s → answer "none of the given"** (value not
 among options).
- **Earth's daily rotation angular speed = π/12 rad per hour** (2π/24 h).
- **Ratio of hour‑hand ω to Earth's ω = 2:1**. ×2
- **At 4 o'clock the hour–minute angular separation = 2π/3 (120°)**.
- **Braking a flywheel 900 → 720 cycle/min in 6 s → angular retardation = π rad/s²**.

**Direction of angular quantities**
- **Right‑hand rule gives direction of angular velocity/displacement**; the direction is along the
 **pointing thumb**. ×2
- **Positive angular displacement → anticlockwise rotation**.
- **Body in the xy‑plane → angular displacement along the z‑axis**.
- **Anticlockwise motion in a horizontal plane → angular velocity out of the page (+z)**. ×2
- **Rotating clockwise with decreasing ω → angular acceleration out of the plane**.
- **Angle between linear velocity v and angular velocity ω in a circle = 90°**.
- **Direction of angular velocity = axis of rotation**.
- **Angular displacement is a vector only for small rotations / small time intervals**. ×3

**Centripetal force and acceleration (most ×3+)**
- **Instantaneous inward acceleration of uniform circular motion = centripetal acceleration**. ×6
- **Centripetal acceleration = rω² = v²/r = 4π²r/T²**. ×5
- **Centripetal force = mrω² = mv²/r**; **radial acceleration = centripetal acceleration**. ×4
- **Centripetal force in SI is measured in newtons (N)**; its direction is **towards the centre**.
- **Radius doubled at constant ω → centripetal acceleration doubles** (a = rω²).
- **Velocity ×2 and radius ×4 → centripetal force unchanged** (F = mv²/r: (2v)²/4r = v²/r).
- **Mass halved, radius doubled, v constant → centripetal force halves**.
- **Mass doubled at same radius → centripetal force doubles**. ×3
- **Centrifugal force = mv²/r**.
- **On a circular track the centripetal force is provided by friction between tyres and road**.
 ×3
- **A cyclist skids when the limiting friction is less than the required centripetal force**.
- **A rotating space-station produces artificial gravity by pushing objects to the outer wall**.
- **Car 1000 kg at 20 m/s, radius 50 m → centripetal force = 8000 N**.

**Torque, angular momentum, moment of inertia**
- **A body rotating with uniform angular velocity experiences zero torque**.
- **Torque produces angular acceleration**; torque = rate of change of angular momentum.
- **Dimensions of angular momentum = [ML²T⁻¹]**.
- **Angular momentum of a particle changing 0 → 720 J·s in 4 s → torque = 180 N·m**.
- **Bohr's allowed orbits have angular momentum = nh/2π**.
- **Moment of inertia is NOT a vector** (it is the rotational analog of mass).
- **Ratio of moments of inertia 2:3 at the same angular acceleration → torques in ratio 2:3**.
- **Angular momentum is the rotational analog of linear momentum**.
- **A neutron entering a magnetic field perpendicular to its velocity moves in a straight line**
 (it has no charge) → cross→u10.

**Apparent weight / gravity**
- **A lift falling freely → apparent weight zero** (80 kg man, weightless). ×2
- **Object suspended in an elevator accelerating down at g → apparent weight = zero**.
- **1 kg on a balance in an elevator decelerating** (or accelerating down at a) reads m(g − a).

**Misc bled**
- **Phase difference π/2 → path difference λ/4**; **90° phase = π/2 radians**. →u6
- **Angular frequency of the SHM projection of uniform circular motion = ω**. →u6
- In an ideal transformer, doubling primary voltage at same turns ratio **halves the secondary
 current**. →u11
- **Earth's energy comes directly from the Sun**. →u16
- **90° of angular displacement = one-fourth of a revolution** (keyed).

---
## u5 — Fluid Dynamics

**Viscosity and Stokes' law**
- **Stokes' law: drag force F = 6πηrv** (sphere in a viscous fluid). ×3
- **Coefficient of viscosity has dimensions [ML⁻¹T⁻¹]**, SI unit **kg m⁻¹ s⁻¹**.
- **Stokes' law applies to spherical surfaces** (a sphere).
- As **speed through a fluid increases, the drag force increases**.
- **The retarding force a moving object feels in a fluid = drag force**.
- **When the drag force equals the weight, a droplet falls at constant speed** (terminal velocity).
- **The maximum constant velocity through a fluid is the terminal velocity**; **terminal
 velocity vt = 2ρgr²/9η** (∝ r²). ×3
- **Radius halved → terminal velocity becomes one‑fourth** (vt ∝ r²).
- **At terminal velocity the acceleration is zero** and the **net force is zero**. ×4
- A **rain droplet reaches constant speed because of the viscous force (drag) of the air**.
- **Net force on a sphere falling in a fluid = weight − drag**.
- **A 1 g droplet reaching max speed 20 m/s → drag force = 9.8×10⁻³ N** (≈ its weight).
- **Max drag = 9.8 N at zero acceleration → real weight = 9.8 N**.
- **10 kg body at terminal velocity → net force = 0 N**.
- A **heavy coin falling a short distance doesn't reach terminal velocity because its weight is
 more than the air resistance**.
- **According to Stokes' law terminal velocity is directly proportional to the square of the
 radius**.
- A **sphere dropped in a viscous liquid** shows a characteristic velocity–displacement curve
 (figure item — v rising then leveling off).

**Equation of continuity**
- **A₁v₁ = A₂v₂** expresses **conservation of mass** in steady flow. ×2
- **Cross‑sectional area × velocity × time = volume** of fluid that passes.
- **The product of area and velocity at any point in streamline flow is constant**.
- **When the pipe narrows the fluid speeds up** (to keep mass flow rate constant). ×3
- **Velocity doubled → area halved** (continuity).
- **Water 3 m/s in a 4 cm pipe entering a 2 cm pipe → 12 m/s** (area ∝ d² → velocity ×4).
- In a **narrowing region the fluid has high velocity and low pressure** (Bernoulli). ×2

**Bernoulli's equation**
- **Bernoulli's equation is based on conservation of energy**. ×2
- **½ρv² is the kinetic energy per unit volume**; **1/2 ρv² has the same unit as pressure**.
- For a **horizontal pipe, P + ½ρv² = constant** (gravity term drops out). ×3
- **Bernoulli: P + ρgh + ½ρv² = constant** along a streamline.
- **In a horizontal tube the pressure is lowest where velocity is highest (diameter smallest)**.
- **The pressure at the narrow end is lower because velocity is higher**.
- **¼ the increased KE with decreased pressure in a horizontal pipe is a consequence of Bernoulli's
 principle**.
- **v = √(2g(h₁ − h₂)) is Torricelli's theorem** (efflux speed).
- **Venturi meter measures the flow rate (speed) of a fluid**; it works on Bernoulli.
- **Reynolds number predicts whether flow is laminar or turbulent** (above critical velocity →
 turbulent).

**Laminar/streamline flow**
- **In laminar (streamline) flow the velocity at any given point remains constant with time**.
- **Adjacent layers in laminar flow slide smoothly past each other**.
- **If streamlines are forced closer together the speed of the fluid increases**.
- **Two rowboats moving parallel are pulled toward each other** (faster water between them drops
 pressure) → pressure between them falls.

---

## u6 — Waves & Oscillations

**Wave types and definitions (multiple ×2–×7)**
- **Transverse wave example: water waves** (sound and spring waves are longitudinal/mechanical;
 electron waves are not travelling medium waves). ×6
- **No net transfer of energy by the particles of the medium in a stationary (standing) wave**.
 ×6
- **Longitudinal waves**: particles vibrate **parallel to the direction of propagation**, high‑pressure
 regions are **compressions** (and are followed by rarefactions). ×3
- **Distance travelled by a wave during one complete vibration of the source = wavelength**;
 **distance between two successive particles in the same state of vibration = wavelength**;
 **shortest distance between two points in phase = wavelength**. ×4
- **Wavelength is the distance between two consecutive crests**. ×2
- **Number of waves passing a point per unit time = frequency**; **1/f = T**; **v = fλ**. ×5
- **Waves per unit time / revolutions per second = frequency**.
- **Mechanical waves cannot travel through outer space because there are no particles to transmit
 them**.
- When a wave crosses a boundary between media, **its frequency does not change**.
- The three parameters characterising a wave = **wavelength, frequency and speed (velocity)**.

**Simple harmonic motion (SHM) — recurring core**
- **v = ω√(x₀² − x²)**; **max velocity vmax = ωx₀**; **total energy E = ½kx₀²**; **ω = 2π/T**.
 ×5
- **Acceleration in SHM ∝ displacement, directed toward the mean position** (a = −ω²x). ×3
- **Amplitude is the maximum displacement from the mean position**.
- **Velocity is maximum at the mean position; zero at the extremes** (there acceleration is
 maximum). ×2
- **KE is maximum at the mean position, PE maximum at the extremes**; **total mechanical energy is
 constant**. ×3
- **Total energy of an oscillator ∝ amplitude²**.
- **Mass‑spring period T = 2π√(m/k)**; **mass ×4 → period doubles**; **m → ¼ → frequency doubles**.
- **Pendulum period T = 2π√(l/g)**; **length ×4 → frequency halves**; **length doubled → frequency
 × 1/√2**; **g → g/4 → period doubles**; **mass change does not alter the period**. ×4
- **Restoring force of SHM ∝ displacement**; pendently restoring force = **mg sinθ**.
- **Time period is independent of amplitude** (for small oscillations).
- **Graph of acceleration vs displacement in SHM is a straight line**. ×2
- **Amplitude doubled → max velocity doubles**.
- **Phase difference between displacement and acceleration of SHM = 180°**.
- **SHM energy depends on the amplitude**; **at extremes PE is maximum**. ×2
- A **body restricted to SHM with A = 0.2 m, ω = 4 → vmax = 0.8 m/s**.
- **Oscillator 20 vibrations in 10 s → angular frequency 12.6 rad/s** (ω = 2π × 2).
- SHM of **period 0.063 s, vmax 3.0 m/s → x₀ = 0.03 m, ω = 100 rad/s**.
- **Pendulum length 9.8 m (g = 9.8) → frequency = 1/2π Hz**; **T = 6.28 s at g = 10 → length
 10 m**.
- **Mass‑spring with m/k = ¼ → period = π**.
- **SHM is oscillation under a restoring force** (that is the definition).
- The oscilloscope/projection link: the **SHM projection of uniform circular motion has angular
 frequency ω**. →u4

**Wave combination — interference, beats, stationary waves**
- **Destructive interference needs a phase difference of 180°**; for destructive superposition the
 phase difference = **(2n+1)π**. ×3
- **Constructive interference needs waves in phase** (path difference = whole wavelength).
- **Two identical waves arriving in phase → resultant = sum of displacements** (double amplitude).
 ×2
- **Two waves equal amplitude, out of phase → resultant = zero** (destruction).
- **Phase difference Δφ = 2π·Δx/λ**; phase π/2 ↔ path λ/4.
- **Superposition says resultant amplitude = sum of individual amplitudes**.
- **Path difference 100 cm, λ = 50 cm → constructive → loudness** (100/50 = 2 whole wavelengths).
- **Path difference = λ gives maximum loudness (constructive)**.
- **Stationary waves form from interference of two identical waves travelling in opposite
 directions**; they are **longitudinal (in air column) or transverse (string)**. ×3
- **In a stationary wave energy is trapped between adjacent nodes** and **is not transported**.
 ×2
- **Antinodes = points of maximum displacement**; **nodes = points of zero displacement (zero
 acceleration)**.
- **Phase difference between two particles in the same loop of a stationary wave = 0°**.
- **Distance between consecutive nodes/int antinodes = λ/2**; distance node–antinode = λ/4. ×2
- **String in 2 loops over 2 m → node spacing 1 m**.
- **Which does NOT cause a stationary wave: two waves of unequal amplitude**.
- **Node spacing for a string fixed at both ends = λ/2**; **distance between consecutive antinodes
 = λ/2**.
- **Beats**: two waves of **256 Hz and 260 Hz → beat frequency 4 Hz**; beats need nearby
 frequencies.
- **WhMa ray beats: frequencies that can interfere constructively must share a common multiple** —
 of the listed pairs only **1000 Hz / 2000 Hz** is a 2:1 (harmonically related) set.
- **Tuning a radio is an example of electrical resonance**; **resonance occurs when the driving
 frequency equals the natural frequency**. ×2
- **Food cooking in a microwave oven is a practical example of resonance**.
- **Interference of light needs two coherent sources**; **interference of sound needs two coherent
 sources**.

**Sound speed and Doppler**
- **Sound speed increases by about 0.61 m/s per 1 °C rise**. ×6
- **Newton assumed isothermal conditions and so underestimated the speed of sound (≈280 m/s)**;
 Laplace corrected it to adiabatic. ×3
- **Speed of sound in air is independent of the pressure of the gas** (at a given temperature);
 it depends on **temperature and density**.
- **Humidity (moist air) makes sound travel FASTER** (denser water vapour molecules: lighter
 effective density → higher speed). ×2
- **Sound travels fastest in solids** (then liquids, slowest in gases); **of gases, H₂ has the
 highest speed of sound** (lightest molecules).
- **Frequency has NO effect on the speed of sound**.
- **Audible range to humans = 20–20000 Hz**; **ultrasonic waves have frequency > 20 kHz**.
- **An object moving faster than sound is supersonic**; a **plane produces a sonic boom when it
 flies faster than the speed of sound**.
- **Doppler effect: apparent change in frequency due to relative motion of source and observer**;
 it applies to **both longitudinal and electromagnetic waves**. ×3
- **Source approaching stationary observer → apparent frequency increases**; formula
 **f′ = f·v/(v − vs)**. ×3
- **Source receding from observer → heard frequency lower**; **observer moving toward a stationary
 source → f′ = f(v + vo)/v**.
- **Police car approaching → observed frequency increases**.
- **A source moving away → observed frequency lower than actual**.
- **A plane at 0.5v approaching: 200 Hz emitted → observer hears 400 Hz**.
- **Red shift of a galaxy's light means it is receding from Earth** → the **universe is expanding**.
 ×2
- **Star line shifted to longer wavelength (589 vs 497 nm) → moving away from Earth** (red shift).

**Resonant pipes and strings (fundamental frequencies)**
- **Stretched string, plucked centre, v = 48 m/s, L = 8 m → fundamental f = v/2L = 3 Hz**. ×7
- **Open pipe fundamental f = v/2L; closed pipe f = v/4L → open = 2× closed**. ×2
- **Organ pipe open (A) vs closed (B) same length → frequency ratio 2:1**. ×3
- **Open pipe 0.3 m, v = 330 m/s → fundamental 550 Hz**.
- **Closed pipe echoes**: shortest closed pipe resonating at 218 Hz (v=340) → length L = v/4f ≈
 39 cm.
- **Closed pipe** produces **only odd harmonics — the 2nd harmonic is absent**; **its 3rd harmonic
 = 3× fundamental**.
- **Ratio 2nd:3rd overtone of an open pipe = 3/4**.
- **A resonating column of air contains stationary longitudinal waves**.
- **String clamped 2 m apart: the three longest wavelengths = 4 m, 2 m, 1.33 m**.
- A **vibrating string 1 m, tension 40 N, mass 0.1 kg → wave speed 20 m/s** (v = √(T/μ)).
- **Tension increased 4× (200 Hz) → frequency doubles to 400 Hz** (f ∝ √T).
- **The ratio of wavelengths of the 1st, 2nd and 3rd harmonics of a string = 3:2:1** (inverse of
 frequencies).

**Sound character / light topics**
- **Loudness is related to the intensity of the wave**; loudness **increases with amplitude**.
- **Echo: distance to a reflecting surface, echo heard 1 s after shout (v=340) → 170 m**.
- **Sound waves are NOT polarized in air because they are longitudinal**; only **transverse waves
 can be polarized**. ×3
- **Longitudinal waves do not exhibit polarisation**.
- **Compression–rarefaction separation = λ/2**: a **440 Hz tuning fork (v=340) gives 0.38 m**
 separation.
- **A wave of λ = 3 m → centre of a compression to next rarefaction = 1.5 m**.
- In the wave equation **y = A sin(kx − ωt + φ)** — **φ is the phase constant**.
- **A wave carries energy** (progressive wave transfers energy across the medium even though the
 particles only oscillate).
- **Continuous periodic disturbance = periodic waves**.
- **A vibrating body's time period is independent of amplitude**.

**Light / EM (blended with optics and atomic lines)**
- **Energy of a quantum of radiation ∝ frequency**; **electron max KE at short wavelength**. ×2
- **Red light is chosen for photographic darkrooms because it has less frequency and more
 wavelength**.
- **γ‑rays have a shorter wavelength than X‑rays**; **γ‑radiation arises from de‑excitation of the
 nucleus**; **1 Sv = 1 Gy × RBE**.
- **Planck's constant = 6.63 × 10⁻³⁴ J s**. ×2
- **Lyman series lies in the ultraviolet region**; **Balmer in visible**; **Paschen/Brackett/Pfund in
 infrared**. ×3
- **Longest Lyman wavelength = 4/3RH**; **longest Balmer wavelength = 36/5RH**; **ratio of longest
 to shortest in the Lyman series = 4/3**; **ratio in Brackett = 25/9**.
- **Electron dropping 2nd → 1st orbit emits λ = 4RH/3**; **Bohr's electron orbits are called
 shells**. ×2
- **Which X‑ray photon has the longest wavelength = Mα** (lowest energy transition).
- **Paschen longest wavelength of the list ≈ 1.87 × 10⁻⁶ m**.
- **Light's wave nature is shown by diffraction, interference and polarisation — NOT by the
 photoelectric effect**. ×2

---

## u7 — Thermodynamics

**Processes and the first law**
- **Best condition for a thermodynamic system to do maximum work = isothermal**. ×12
- **Isothermal process: temperature stays constant**; **change in internal energy ΔU = 0**;
 **Q = W**; **PV = constant (Boyle)**. ×4
- **Isochoric (constant volume) → work = 0**; **isobaric (constant pressure) → work = PΔV**.
- **Adiabatic (no heat exchange): Q = 0**; **Q = 0 in an adiabatic process** (value of heat energy
 Q = 0). ×3
- **First law: Q = ΔU + W** (energy conservation). ×3
- During an **adiabatic expansion the system doing work has its internal energy decrease**;
 rapid compression of a gas is **adiabatic** (no time to exchange heat) → **temperature rises**.
 ×2
- **Boyle's law holds under isothermal conditions**; and during an isothermal compression the
 product PV is **constant**. ×2
- **A gas expanded 1 m³ → 3 m³ at constant pressure 2 Pa does work 4 J** (PΔV = 2×2).
- **Isothermal work (initial value relation)**: work needed is greatest in the **adiabatic, then
 isothermal, then isobaric** order for compressing a gas to half its volume (ranking item).
- **The adiabatic curve is steeper than the isothermal curve on a P–V diagram**. ×2
- **Hess's law states the same as the first law of thermodynamics** (state-function enthalpy). →u8
- The **first law governs "energy cannot be created or destroyed in a thermodynamic system"**.

**Molar heat capacities and specific heats**
- **Cp − Cv = R for an ideal gas**; **Cp > Cv because extra heat (RΔT) does work at constant
 pressure**. ×2
- **Ratio of specific heats Cv/Cp = γ; for gases this is less than 1**.
- **Cv = heat to raise 1 mole by 1 K at constant volume**; **Cp = heat to raise 1 mole by 1 K at
 constant pressure**; **CvΔT = change in internal energy**. ×3
- **SI unit of molar specific heat = J mol⁻¹ K⁻¹**.
- **For an isobaric process Q = nCpΔT**; heating at constant V (**CvΔT = ΔU**).
- **Raise n moles at constant pressure by ΔT → increase in internal energy = n(Cp − R)ΔT**.
- **Helium in isobaric heating**: n moles at constant pressure, the heat supplied Q = nCpΔT.
- **Heat required to raise 1 mole of gas by 1 K at constant volume** defines Cv.

**Entropy and the second law**
- **Second law of thermodynamics is associated with entropy**; **total entropy of an isolated
 system never decreases**. ×2
- **Entropy of an isolated system tends to increase** (it can't decrease).
- **Carnot engine efficiency depends only on the temperatures of source and sink** (not the working
 substance). ×2
- **Carnot cycle consists of both adiabatic and isothermal steps** (four stages, two each).
- **Refrigerator COP = Tc/(Th − Tc)**.
- A heat engine **absorbing 800 J and rejecting 500 J → efficiency = 37.5%** (1 − 500/800).
- **Heat engine 50% efficient, hot reservoir 327 °C → cold reservoir at 27 °C** (keyed: rankine —
 work Kelvin: Th = 600 K, η 0.5 → Tc = 300 K = 27 °C).
- **Turbine taking heat from 427 °C and exhausting at 77 °C → possible efficiency 50%**.

**Thermal equilibrium / temperature**
- **Two objects in thermal equilibrium have the same temperature**. ×2
- **Zeroth law: two systems each in thermal equilibrium with a third are in thermal equilibrium
 with each other**.
- **Celsius and Fahrenheit give the same reading at −40°**.
- **A gas at 150 °C → 300 °C in an isobaric process**, volume becomes **less than double** (must
 use Kelvin: 423 → 573 K).
- **500 g water heated 20→40 °C (c = 4200) needs 42000 J** (mcΔT = 0.5 × 4200 × 20).

**Application examples**
- **The rapid escape of air from a burst tyre is an adiabatic process**.
- **Heating a gas in a sealed rigid container is isochoric (constant volume)**; a **gas expanding
 against a movable piston at constant pressure is isobaric**.
- **Drilling a metal surface makes the drill hot due to work done against friction**. →u3
- **Strain energy of a deformed body is stored as potential energy**. →u3

---

## u8 — Electrostatics

**Fields, potential, units**
- **SI unit of capacitance = farad**; **relative permittivity has no unit** (dimensionless); **unit
 of electric field intensity = volt per metre**; **electron-volt is a unit of energy**. ×5
- **Unit of charge in base units = ampere·second (As)**; 5 μC = **5 × 10⁻⁶ ampere·second**;
 **electric field strength E = F/Q has base units kg m s⁻³ A⁻¹**. ×4
- **An electric field exists in a region if a test charge placed there experiences a force**; the
 field of a point charge **E = kq/r²**.
- **Coulomb's law: force between two point charges ∝ product of the charges, inversely ∝ the
 square of the distance between them**.
- **V = W/q represents electric potential**; **moving a unit charge between two points at the same
 potential does zero work**.
- **D = Q/A (symbol) represents electric flux density**; **formula Φ = BA cosθ is magnetic flux**
 (→u10).
- **Electric generators and transformers are based on Faraday's law**.
- **A capacitor's energy = ½CV²**; a flash unit at 5 V stores ½·C·25 (numeric — work the formula
 from C and the battery voltage, never the damaged option letters).
- **Capacitor 2 μF in series with 1 MΩ and 12 V takes τ = RC = 2 s to reach 63% of its final
 charge**.

**Capacitance arithmetic**
- **Doubling plate area and halving plate separation → capacitance ×4** (C = εA/d).
- **Inserting a dielectric between the plates increases the capacitance by the relative permittivity
 factor** (C = ε₀εᵣA/d); **placing a dielectric between a capacitor's plates also prevents the
 plates from touching/arcing**.
- **1 μF capacitor at 10 V stores 0.05 mJ** (½CV²).
- **5 μF charged to 12 V stores a charge of 60 μC** (Q = CV).
- **Parallel plate: 2 mm gap, 2 m² plates in vacuum → C = 8.85 × 10⁻⁹ F**.
- **Doubling length, width AND separation → capacitance doubles** (A ×4, d ×2).
- **In a purely capacitive AC circuit, doubling the capacitance doubles the current** (I = V/Xc =
 VωC). →u12
- **Bodies at the same potential — no current flows between them when connected** (keyed). →u9

**X-ray / electron acceleration (bled from atomic physics)**
- **X-ray minimum wavelength can be reduced by increasing the potential difference between target
 and cathode**.
- **KE of the electrons = eV → KE ∝ V**, so V₁:V₂ = 2:3 gives **KE 2:3**.
- **Speed of the electron in an X-ray tube v = √(2eV/m)**. ×2
- **X-ray tube at 20 kV, 20 mA → λmin = 6.19 × 10⁻¹¹ m**.
- **Representative numeric**: a body moving along a semi-circular path radius r (from one end of a
 diameter to the other) has ratio distance:displacement = **π:2**. →u2
- Magnetic/B-field line items (direction around a straight conductor, field decreasing away from
 the conductor) belong to u10 and are recorded there.

---

## u9 — Current Electricity

**Definitions and units (most ×5)**
- **Gradient (slope) of the I–V graph = conductance** (I/V = 1/R). ×5
- **60 A for 60 s → charge = 3.6 × 10³ C** (Q = It). ×5
- **1 kWh = 3.6 MJ** (and = 3.6 × 10⁶ J). ×5
- **Negative temperature coefficient of resistance: germanium** (a semiconductor); **semi-conductors
 have resistance that decreases as temperature rises**. ×5
- **SI unit of current = ampere**; **volt × ampere = power**. ×5
- **Ohm's law**: current is directly proportional to voltage **as long as the temperature of the
 conductor is kept constant**.
- **Reciprocal of resistivity = conductivity** (→u12).

**Power and internal resistance**
- **Power output of a circuit is maximum when external resistance R = internal resistance r**. ×4
- **Efficiency of an emf source = 50% when the load resistance equals the internal resistance**.
- **Internal resistance lowers the terminal voltage because it causes power loss inside the
 battery**.
- When a battery is being **charged, the current inside it flows opposite to the direction of its
 emf**.

**Resistivity / resistance**
- **Doubling the length of a copper wire does NOT change its resistivity** (resistivity is an
 intrinsic property); **specific resistance stays unchanged with length**; it does change the
 resistance, not the resistivity. ×3
- **A positive temperature coefficient means resistance increases with rising temperature**.
- **Replacing a resistor with double the resistance (with the same battery) → current halves
 (2 A → 1 A)** (V fixed, I = V/R).

**Networks (resistance between points)**
- Three **6 Ω** resistors in a delta with the third in the odd branch → equivalent resistance
 between A and B = **4 Ω** (figure item).
- **A 12 Ω wire bent into an equilateral triangle → resistance between any two corners ≈ 2.7 Ω**
 (two corners: 12/3 = 4 Ω and 8 Ω in parallel → 4∥8 = 2.67 Ω).
- **Thin square film 1 mm², 1 μm thick, ρ = 10⁻⁶ Ω·m → R ≈ 10 Ω**.
- The **1 A reading** item: required potential difference across a 6 Ω resistor to pass 1 A is
 **6 V**.

**Electrolysis / electrolytes (bled)**
- **In an electrolytic cell the anode is the positive electrode where oxidation occurs**.
- **Acidified water on electrolysis gives both hydrogen and oxygen**.
- **Potassium ferrocyanide is a complex salt**. →Chem
- pBr322 antibiotic-resistance genes (ampicillin & tetracycline) is a biology stray →Bio u13.

---

## u10 — Electromagnetism

**Definitions and units (most ×5)**
- **Magnetic flux becomes zero when the angle between B and the vector area is 90°** (Φ = BA cosθ).
 ×5
- **Rate of change of magnetic flux is measured in volts** (that is the induced emf). ×5
- **Weber is the SI unit of magnetic flux — 1 Wb = 1 volt·second = 1 joule per ampere**; **magnetic
 flux = dot product of magnetic field and vector area**. ×2
- **Tesla is the SI unit of magnetic field intensity — 1 T = N A⁻¹ m⁻¹**; **magnetic field strength
 (flux density) unit = Wb m⁻²**. ×5
- **Magnetic flux density (unit) = Wb m⁻²**.
- **The induced current flows so as to oppose the cause that produces it — this is Lenz's law**.

**Forces, motion of charged particles**
- **Force on a conductor, with angle changed to 45° → F/√2** (F sin45°). ×2
- **A neutron entering a magnetic field perpendicular to its velocity is undeflected** — it moves
 in a **straight line with zero (centripetal) acceleration** because it has no charge. ×2
- **A charged particle entering a magnetic field parallel to it moves in a straight line**
 (no force: v∥B). ×2
- **α parities deviate less than β in a field because the α particle is heavier**.
- **Why do two electrons in the same orbital spin oppositely — this condition results in less
 repulsion and opposite magnetic fields**.

**Solenoids and field patterns**
- **Doubling the number of turns of a solenoid/circular coil (same current and radius) doubles the
 magnetic flux density** (B ∝ N).
- **Cutting a solenoid in half reduces the magnetic induction to half** (fewer turns).
- A solenoid of 10 cm, 100 turns, 1 μA → **B = 4π × 10⁻¹⁰ tesla** (B = μ₀nI).
- Inserting an **iron core** into a solenoid strengthening its field **pulls a nearby small magnet
 toward it** (magnetic attraction increases).
- **Two parallel wires carrying equal and opposite currents** — field strength around them varies
 (figure item; midpoint region sees cancelling fields).
- Direction of B-field lines around a straight current-carrying conductor: **clockwise when viewed
 in the direction of current flow**; field lines become **less dense (weaker) away from the
 conductor**.

**CRO & practicals**
- **The electron gun of a cathode-ray oscilloscope contains filament, cathode, grid and anode**.
- **Electron-volt is the unit of energy** (→u8).

---

## u11 — Electromagnetic Induction

- **Step-up transformer, turns ratio 5, primary 20 A at 220 V → secondary voltage = 1100 V**.
 ×5
- **Coil of 100 turns, flux 20 mWb reversed in 2 ms → induced emf = 2000 V** (ε = NΔΦ/Δt).
 ×5
- **Lenz's law is in accordance with the law of conservation of energy**. ×5
- **If the rate of change of current in the primary is increased by 1.5×, the emf induced in the
 secondary becomes 3/2 (1.5) times** (ε ∝ dI/dt). (keyed)
- **In a step-up transformer if secondary voltage is increased ×10, the secondary current is 1/10
 of the primary current** (constant power).
- **Internal resistance reduces terminal voltage because it causes power loss inside the battery**
 (→u9).
- **In an AC generator the emf is maximum when sinωt = 1**.

---

## u12 — Alternating Current

- **An alternating-current generator converts mechanical energy into electrical energy**. ×4
- **Visible region of the electromagnetic spectrum = 400–700 nm**.
- **Which statement about X-rays is INCORRECT — "they have higher wavelength than visible light"**
 (X-rays actually have shorter wavelength).
- **Accelerating electromagnetic charges radiate waves that propagate at the speed of light**;
 **EM waves in free space travel at c = 3 × 10⁸ m/s**.
- **Reciprocal of resistivity of a material = conductivity**.
- In a **purely capacitive AC circuit, doubling capacitance doubles the current** (→u8).

---

## u13 — Electronics

**Diodes and rectification (most ×5)**
- **A diode is a semiconductor device used for rectification**; **AC → DC conversion (rectification)
 uses a diode acting as a rectifier**. ×5
- **Full-wave rectification is given by four diodes connected in a bridge arrangement**.
- **The depletion region of a PN junction has no free charges — only positive and negative ions**.
- **A diode characteristic curve is a plot of voltage against current** (V–I).
- **Photodiode** generates an output voltage when placed in light.
- **The circuit required to change AC to DC is called a rectifier**.
- Diode rectifier I–V curve (figure item — the standard one-sided conduction curve).

**Logic gates**
- **NAND gate Boolean expression: X = (A·B) with a bar over the whole** (the correct option is
 X = A·B overbar).
- **Connecting three NAND gates forms an AND (or OR/NOR depending on arrangement) gate** — figure
 item; match the truth table to the gate.
- **Output table x = AB + A̅B̅ (XNOR)** — truth table item; **the "YES" operation is not one of
 the basic Boolean (AND/OR/NOT) operations**.
- **The sequence of fundamental logic gates**: figure items — compute the Boolean expression and
 the truth table directly from the wiring.
- For the logic-diagram Boolean-expression items, work the truth table row by row (0,0 → 1; 0,1 →
 0; 1,0 → 0; 1,1 → 1 matches XNOR; other outputs match AND/OR/NAND/NOR accordingly).

**Optics / human eye (bled)**
- **Near point (least distance of distinct vision) of a normal human eye = 25 cm**; the **near
 point** is where the eye can focus a sharp image. ×2
- **In normal adjustment of a compound microscope the final image is formed at infinity**.
- **Information is transmitted very safely and easily by optical fibre**.
- **CAT in X-ray technology = Computerized Axial Tomography**.
- **A laser/optical application**: plane polarised light measures sugar concentration (→u6).

**Efflux (Torricelli bled items)**
- **Efflux speed 9.8 m/s through a hole → height of fluid above the hole = 4.9 m** (v = √2gh).
- **Hole in a 2 m cylinder**: efflux is **maximum from the lowest hole (0.3 m)** because the water
 column above it is tallest. ×2
- **20 m tank, hole at the middle (height 10 m above the base) → efflux speed 14 m/s**.

**Systems / electrolysis (stray)**
- **An open system allows the transfer of both mass and energy**.
- **Plasma constitutes about 55% of blood by volume** (→Bio).
- English/Logical-Reasoning strays (parody uses exaggerated language to entertain and mock; syllogism
 melons/apples items) are recorded only for the coverage audit and are outside the
 Physics/Chemistry/Biology scope.

---

## u14 — Dawn of Modern Physics

**Photoelectric / photon energy**
- **Planck's constant h = 6.6262 × 10⁻³⁴ J·s**.
- **The photon with the most energy in the visible spectrum is violet** (E = hf; violet has the highest frequency).
- **X-rays consist of high-energy photons** (they are electromagnetic radiation, not particles or protons).

**Compton effect**
- **Compton shift depends most strongly on the scattering angle of the photon** (not on electron spin or photon energy directly).
- **Maximum Compton shift occurs at a scattering angle of 180°** (full backscattering).

**Subatomic particles**
- **Particles with mass less than protons are mesons** (e.g. pion ≈ 0.15 × proton mass).
- **Beta-minus (β⁻) decay: a neutron converts into a proton** (n → p + e⁻ + ν̄e); the atomic number Z increases by 1 while the mass number A is unchanged.

---

## u15 — Atomic Spectra

**Bohr atom / energy levels**
- **Ground state corresponds to minimum energy**.
- **The potential to accelerate an electron from its ground state to a higher state is called excitation potential** (distinguished from ionisation potential, which fully removes the electron).
- **Hydrogen-atom radius in the 2nd orbit is four times the ground-state radius** (r_n = n²r₁).
- **Hydrogen emission spectrum: several discrete series of lines whose intensity and spacing decrease as wavenumber increases within each series** (Lyman → UV, Balmer → visible, Paschen → IR).
- **Protons and neutrons are located in the nucleus**.
- **Wavelength emitted in an atomic transition between states Ei and Eo = hc/(Ei − Eo)**.

**Atomic configurations / unpaired electrons**
- **Boron has 1 unpaired electron in its ground state** (1s²2s²2p¹ → one unpaired 2p electron).
- **Fe³⁺ (Z = 26, 5 electrons removed: 3d⁵) has 5 unpaired electrons**.
- **An element with four unpaired electrons in its ground state has proton number 26 (iron)** — [Ar] 3d⁶ has four unpaired.

**Lasers**
- **LASER = Light Amplification by Stimulated Emission of Radiation**.
- **Laser light is coherent and monochromatic**.
- **Population inversion in a He–Ne laser is achieved in the neon atoms** (helium acts as the pumping partner).
- **Population inversion is created by optical pumping**.
- **In stimulated emission, the two photons produced have identical wavelength (λA = λB)**.
- **The active (lasing) gas in a He–Ne laser tube is neon**; **CO₂ is the active medium in high-power IR lasers**.
- **Helium–neon lasers are used for precise range-finding**.
- **Generating a 3D image of an object using a laser beam is called holography**.

**X-rays**
- **The target in an X-ray tube must have a high atomic number** (tungsten is the standard target material).
- **The continuous X-ray spectrum is produced by bremsstrahlung** (braking radiation).
- **X-ray spectrum shows a continuous background with characteristic superimposed lines**.
- **Kβ photon energy = EM − EK** (electron falls from the M shell to the K shell; the Kα line is the L→K transition).
- **Minimum wavelength λmin of an X-ray tube = hc/eV; every emitted wavelength is not less than (≥) λmin**.

---

## u16 — Nuclear Physics

**Radioactivity definitions (highest-weight x5 items)**
- **1 becquerel (Bq) = 1 nuclear decay per second** (SI unit of activity). ×5
- **T₁/₂ of Iodine-131 is 8 days**; **Iodine-131 is used to treat thyroid cancer**. ×5
- **λ = 0.693 / T₁/₂** (decay constant–half-life relation); if T₁/₂ = 0.693 yr then **λ = 1 yr⁻¹**. ×5
- **Thyroid cancer treated with Iodine-131** (not Co-60, which is used for external beam radiotherapy). ×5

**Alpha, beta, gamma decay**
- **α decay: mass number A drops by 4, atomic number Z drops by 2** (emits ⁴₂He). ×5
- **β⁻ decay: Z increases by 1, A unchanged** (neutron → proton); **parent and daughter from β⁻ decay are isobars** (same A). ×5
- **γ rays have the least ionizing ability of α, β and γ**; **α has the greatest ionizing power**.
- **α-particle charge = +2e** (and mass ≈ 4 u).
- **After emitting 1α and 2β⁻, A drops by 4 and Z is unchanged** (−2 +1 +1).
- **After emitting one α, one β and one γ, the nucleon number decreases by 4** (only α changes A).
- **Ra226 → Rn222 + α** (mass number: 226 − 4 = 222; Z: 88 − 2 = 86).
- **The nucleon number A decreases by 4 in α decay and by 0 in β decay**.
- **Of γ decay, neutron emission and β decay, only beta decay changes the atomic number** (γ: neither A nor Z changes).
- **β⁻ track in a Wilson cloud chamber: thin and irregular/curved** (vs α: thick, short, straight; γ: faint, long).
- **A photon of gamma radiation has more energy than an X-ray photon of the typical tube spectra** (both move at c).
- **Electronic (orbital) transitions emit from infrared up to X-rays — they cannot emit gamma rays** (γ rays come from the nucleus).

**Absorbed dose and units**
- **Gray (Gy): unit of absorbed dose = 1 joule per kilogram**. ×5
- **To double the absorbed dose in gray, the absorbed energy must be doubled** (dose = energy/mass).
- **10 J absorbed by a 10 g mass → absorbed dose = 1000 gray** (10 J ÷ 0.01 kg).
- **Becquerel: SI unit of activity**; **curie = 3.7 × 10¹⁰ Bq** (old unit).
- **Unit of decay constant λ = s⁻¹** (per second).
- **Roentgen measures ionising ability; sievert measures biological effective dose**.
- **Rad is a unit of absorbed dose** (100 rad = 1 Gy).

**Half-life numerics**
- **Na-24 half-life = 15 hours**; used to **estimate plasma blood volume**. ×5
- **Th-234: 8 kg after 72 days (T₁/₂ = 24 d) → 1 kg** (3 half-lives: 8→4→2→1).
- **Na-24 after 4 half-lives (60 h) → 6.25% remaining**.
- **C-14 T₁/₂ = 5730 yr; after 11460 yr → 1/4 remains** (2 half-lives).
- **I-131 T₁/₂ = 8 d; after 24 d → 5 g** (40→20→10→5, 3 half-lives).
- **Count rate 240 → 30 in 60 min → T₁/₂ = 20 min** (240/30 = 8 = 2³; 3 half-lives in 60 min).
- **N₂O₅ T₁/₂ = 24 min; 25% left after 48 min** (2 half-lives).
- **Cobalt-50 T₁/₂ = 4.3 yr; 1/32 remains after 21.5 yr** (5 half-lives).
- **1/8 remaining after 1 hr → T₁/₂ = 20 min** (3 half-lives).
- **25% remaining means 2 half-lives have elapsed** (100%→50%→25%).
- **"half-life is directly proportional to decay constant" is false** — it is **inversely proportional**.

**Decay law and probability**
- **Rate of radioactive decay = −λN** (N = number of undecayed nuclei at time t).
- **Activity (rate of decay) depends on the number of atoms N present; half-life does not**.
- **Decay constant λ is the probability that a given nucleus decays in unit time; λ is independent of the age of the atom**.
- **Greater decay constant → greater activity** (activity = λN).
- **The ratio of decay rate to number of nuclei present = decay constant**.

**Isotopes and nuclear structure**
- **Isotopes: same number of protons, different numbers of neutrons**.
- **Atomic number is determined by the number of protons**.
- **Top quark charge = +⅔ e**; **three quarks make up a baryon**; **mesons = quark + antiquark pair**.

**Radioisotope applications**
- **Cobalt-60 used for external radiotherapy**; **Iodine-131 for thyroid cancer**.
- **Phosphorus-32 used for blood-circulation studies** (but Na-24 for plasma blood volume).
- **Proton mass ≈ 1836 × electron mass**.

**Nuclear reaction balance**
- **In ⁹₄Be + ⁴₂He → ⁶₆Ca + ¹₀n**: balancing nucleons → A = 12 (Be9 + He4 = 13; 13 − 1 = 12); this is actually ⁶₁₂C (carbon-12).

**Bled / misclassified strays (noted for coverage audit)**
- Chemical reaction (2Na + Cl₂ → 2NaCl with 4 mol Na + 2 mol Cl₂ → 0 mol Cl₂ remains), gas laws (P doubled at constant T → density increases; T,V doubled → pressure unchanged), common-ion effect (HCl added to brine → NaCl solubility decreases), thermodynamics (isothermal/adiabatic processes), mechanical (centripetal force doubles with mass), cytosol (Bio), English comprehension — these sit in u16 only because the source papers mixed questions on the same page.

---
