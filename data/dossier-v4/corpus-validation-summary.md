# Dossier v4 corpus validation

Built 10250 pages in process from the local database.

- Pages with a critical issue: **0**
- Pages with any issue: **370**
- Pages that built with no issue: **9880**

### Publication state

| Value           | Pages |
| --------------- | ----- |
| preliminary     | 6896  |
| limited         | 3351  |
| not_found       | 2     |
| correction_hold | 1     |

### Substance type

| Value                     | Pages |
| ------------------------- | ----- |
| botanical                 | 4042  |
| prescription_medicine     | 2452  |
| dietary_supplement        | 2118  |
| biologic                  | 510   |
| unknown_type              | 335   |
| nutrient                  | 312   |
| monoclonal_antibody       | 132   |
| hormone                   | 83    |
| peptide                   | 73    |
| research_compound         | 56    |
| vaccine                   | 52    |
| withdrawn_substance       | 29    |
| rna_medicine              | 27    |
| gene_therapy              | 24    |
| investigational_substance | 3     |
| (none)                    | 2     |

### Availability

| Value                     | Pages |
| ------------------------- | ----- |
| varies_by_jurisdiction    | 6241  |
| prescription_only         | 2544  |
| clinician_administered    | 400   |
| investigational           | 384   |
| withdrawn                 | 321   |
| sold_without_prescription | 215   |
| unresolved                | 122   |
| unavailable               | 21    |
| (none)                    | 2     |

### Measurement mode

| Value               | Pages |
| ------------------- | ----- |
| self_experiment     | 5979  |
| clinician_questions | 4269  |
| (none)              | 2     |

### Issues

| Severity | Code                      | Pages | Example                                                                         |
| -------- | ------------------------- | ----- | ------------------------------------------------------------------------------- |
| high     | no_record                 | 2     | header: Neither a corpus page nor a legacy row.                                 |
| medium   | substance_type_unresolved | 335   | 1-3-butanediol: No recorded field settles what kind of substance this is.       |
| medium   | availability_unresolved   | 122   | 1-3-butanediol: No register row or approval field settles how this is supplied. |
