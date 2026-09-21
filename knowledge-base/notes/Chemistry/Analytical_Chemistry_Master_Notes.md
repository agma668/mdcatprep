# Master Notes: 24. Analytical Chemistry

> **Study Directive:** The exam loves testing the **regions of the electromagnetic spectrum** and asking you to match a specific functional group to its characteristic **IR absorption frequency**. You must also know the exact working principle of the **Mass Spectrometer** and how it determines isotopic masses. Pay close attention to the difference between **Atomic Emission** and **Atomic Absorption** spectroscopy.

---

## 24.1 Classical and Modern Methods of Analysis

### 24.1.1 Classical vs Modern Methods
- **Classical (Wet) Methods:** Based on chemical reactions — titrations, gravimetric analysis, qualitative salt analysis. They are simple but often slow, require large sample sizes, and can be destructive.
- **Modern (Instrumental) Methods:** Based on the interaction of matter with electromagnetic radiation (spectroscopy) or on separating ions by mass (mass spectrometry). They are incredibly fast, require tiny sample sizes, are non-destructive, and provide far more detailed structural information.

### 24.1.2 Combustion Analysis of Hydrocarbons
Used to determine the **empirical formula** of an organic compound.
- **Procedure:** A known mass of the organic compound is burned completely in excess pure $O_2$. The combustion products are:
 - **$CO_2$:** Absorbed by concentrated $KOH$ (or $NaOH$) solution. The increase in mass of the $KOH$ absorber = mass of $CO_2$ produced → used to calculate mass of Carbon.
 - **$H_2O$:** Absorbed by anhydrous $CaCl_2$ (or $Mg(ClO_4)_2$). The increase in mass of the $CaCl_2$ absorber = mass of $H_2O$ produced → used to calculate mass of Hydrogen.
- From the masses of C and H, calculate moles, find the simplest whole-number mole ratio, and determine the empirical formula.

### 24.1.3 Define Spectroscopy
**Spectroscopy** is the study of the interaction of **electromagnetic radiation** with matter. Different types of radiation cause different types of molecular transitions (electronic, vibrational, rotational), and the pattern of absorption or emission provides a unique "fingerprint" that reveals the structure and identity of the substance.

### 24.1.4 Applications of Spectroscopy
- **Qualitative Analysis:** Identifying unknown compounds by matching their spectra against known reference spectra.
- **Quantitative Analysis:** Determining the concentration of a substance in a mixture (Beer-Lambert Law).
- **Structure Determination:** Identifying functional groups ($-OH, C=O, N-H$), bond types, and molecular geometry.

### 24.1.5 Regions of the Electromagnetic Spectrum
Listed in order of **decreasing wavelength** (increasing energy):

| Region | Wavelength Range | Type of Transition |
| :--- | :--- | :--- |
| **Radio Waves** | $> 1 \text{ m}$ | Nuclear spin (NMR Spectroscopy) |
| **Microwaves** | $1 \text{ mm} - 1 \text{ m}$ | Molecular Rotation |
| **Infrared (IR)** | $700 \text{ nm} - 1 \text{ mm}$ | Molecular Vibration (stretching/bending of bonds) |
| **Visible Light** | $400 - 700 \text{ nm}$ | Electronic transitions (outer electrons) |
| **Ultraviolet (UV)** | $10 - 400 \text{ nm}$ | Electronic transitions (bonding/non-bonding electrons) |
| **X-rays** | $0.01 - 10 \text{ nm}$ | Inner-shell electronic transitions |
| **Gamma Rays** | $< 0.01 \text{ nm}$ | Nuclear transitions |

### 24.1.6 Atomic Emission vs Atomic Absorption Spectrum
- **Atomic Emission Spectrum:** When atoms are heated (e.g., in a flame), electrons are excited to higher energy levels. When they **fall back down**, they emit photons of specific wavelengths, producing bright colored lines on a dark background. Each element has a unique emission spectrum (its "fingerprint"). Used in **Flame Tests** and **AES**.
- **Atomic Absorption Spectrum:** When white light (containing all wavelengths) is passed through a cold gaseous sample of atoms, the atoms absorb photons of exactly the same specific wavelengths they would normally emit. This produces **dark lines** (missing wavelengths) on a continuous bright background. Used in **AAS (Atomic Absorption Spectroscopy)** for quantitative trace metal analysis.

### 24.1.7 Infrared (IR) Spectroscopy — Principles
- **Principle:** Molecules absorb IR radiation, causing their covalent bonds to **vibrate** (stretch and bend) more vigorously. Only bonds with a **changing dipole moment** during vibration absorb IR radiation. (Symmetric diatomic molecules like $O_2, N_2, H_2$ are **IR inactive** because their vibrations do not change the dipole moment).
- **Types of Molecular Vibrations:**
 - *Stretching:* Bond length changes (symmetric stretch, asymmetric stretch).
 - *Bending:* Bond angle changes (scissoring, rocking, wagging, twisting).
- **Vibrational Coupling:** When two vibrating bonds are adjacent and share a common atom, they interact and influence each other's absorption frequencies, creating complex but characteristic patterns.

### 24.1.8 Interpreting IR Spectra (HIGH YIELD — Characteristic Absorptions)
Each functional group absorbs IR radiation at a specific, characteristic frequency (measured in Wavenumber, $cm^{-1}$). You must memorize these key values:

| Functional Group / Bond | Characteristic Absorption ($cm^{-1}$) | Appearance |
| :--- | :--- | :--- |
| **$O-H$ (Alcohol)** | $3200 - 3550$ | Broad, strong |
| **$O-H$ (Carboxylic Acid)** | $2500 - 3300$ | Very broad, strong (overlaps C-H region) |
| **$N-H$ (Amine)** | $3300 - 3500$ | Medium, sharp (2 peaks for $1^\circ$ amine) |
| **$C-H$ (Alkane)** | $2850 - 3000$ | Strong |
| **$C=O$ (Carbonyl)** | $1650 - 1750$ | Very strong, sharp (THE most diagnostic peak) |
| **$C=C$ (Alkene)** | $1600 - 1680$ | Medium |
| **$C\equiv C$ (Alkyne)** | $2100 - 2260$ | Weak/medium |
| **$C\equiv N$ (Nitrile)** | $2200 - 2260$ | Medium, sharp |

**Key Spectra to Recognize:**
- **Benzene:** Strong $C-H$ stretch just above $3000 \text{ cm}^{-1}$, characteristic $C=C$ aromatic ring stretches around $1450-1600 \text{ cm}^{-1}$.
- **Acetone ($CH_3COCH_3$):** Dominant, sharp $C=O$ peak near $1715 \text{ cm}^{-1}$, $C-H$ stretches near $2900 \text{ cm}^{-1}$.
- **Acetic Acid ($CH_3COOH$):** Extremely broad $O-H$ absorption ($2500-3300$) + sharp $C=O$ peak near $1710 \text{ cm}^{-1}$.
- **Ethanol ($C_2H_5OH$):** Broad $O-H$ stretch ($3200-3500$), $C-H$ stretches ($2850-3000$), $C-O$ stretch ($1000-1100$).

### 24.1.9 UV-Visible Spectroscopy — Prediction of Absorption
- **Principle:** UV-Visible radiation causes **electronic transitions** — specifically, electrons jump from bonding/non-bonding orbitals to higher-energy anti-bonding orbitals.
- **Which molecules absorb UV-Visible light?**
 - Molecules must contain **chromophores** — functional groups with $\pi$-bonds or non-bonding lone pairs (e.g., $C=C, C=O, N=N, -NO_2$, conjugated systems, aromatic rings).
 - **Saturated hydrocarbons** (like methane, ethane) do NOT absorb in the UV-Visible range (they only have $\sigma$ bonds requiring far too much energy to excite).
- **The Conjugation Rule:** The more extended the conjugation (alternating single and double bonds), the **longer the wavelength** absorbed (shifts toward visible light). This is why highly conjugated molecules are colored.

### 24.1.10 Predicting Colors from UV-Visible Spectra
- **Methylene Blue:** A highly conjugated aromatic dye. Its extended $\pi$-system absorbs orange/red light (around $\lambda_{max} \approx 665 \text{ nm}$). The complementary color that is transmitted/reflected to our eyes is **deep blue**.
- **$[Ti(H_2O)_6]^{3+}$:** A $d^1$ transition metal complex. The $d$-electron undergoes a $d$-$d$ transition, absorbing light in the **yellow-green** region ($\approx 500 \text{ nm}$). The complementary color transmitted is **purple/violet**.
- **General Rule:** The observed color of a substance is the **complementary color** of the wavelength it absorbs.

### 24.1.11 Mass Spectrometry (MS) — Instrumentation and Working
A Mass Spectrometer separates gaseous ions based on their **mass-to-charge ratio ($m/z$)**.
**Working Steps:**
1. **Vaporization:** The sample is converted into a gas.
2. **Ionization:** The gaseous sample is bombarded with a beam of high-energy electrons, which knock out an electron from the molecule, forming a **positive ion** (molecular ion / radical cation, $M^{+\bullet}$).
 $M + e^- \to M^{+\bullet} + 2e^-$
3. **Acceleration:** The positive ions are accelerated through an electric field, giving them all the same kinetic energy.
4. **Deflection:** The ions pass through a strong magnetic field, which curves their path. **Lighter ions and ions with higher charge are deflected more.** Heavier ions are deflected less.
5. **Detection:** A detector at the end records the abundance of ions at each $m/z$ value, producing a **Mass Spectrum** (a bar graph of relative abundance vs $m/z$).

### 24.1.12 MS for Determining Relative Isotopic Masses
- The mass spectrum of an element directly reveals its **isotopes** as distinct peaks at different $m/z$ values.
- The **height (relative abundance)** of each peak tells you the percentage of that isotope in nature.
- **Example (Chlorine):** The mass spectrum of $Cl$ shows two peaks:
 - $m/z = 35$ (relative abundance $\approx 75\%$) → $^{35}Cl$
 - $m/z = 37$ (relative abundance $\approx 25\%$) → $^{37}Cl$
- From these, the **Relative Atomic Mass** can be calculated as a weighted average:
 $RAM = \frac{(35 \times 75) + (37 \times 25)}{100} = 35.5$
