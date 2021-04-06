# Node.js Resume Builder
A Node.js tool that creates a standard resume in PDF from a given configuration

## Installation 
`npm i resume-pdf --save`

## Usage
`resume-pdf` package provides the `ResumePDF` function that returns a [jsPDF](https://www.npmjs.com/package/jspdf) instance.

See [jsPDF](https://www.npmjs.com/package/jspdf) for more documentation.  The example below shows how to save the PDF in the current working directory.

```
import ResumePDF, {ContentConfig} from "resume-pdf";

const resumeContent: ContentConfig = {
     header: {
         name: 'John Smith',        // Your name
         phone: '123-456-7890',     // Your phone number
         email: 'John@gmail.com'}   // Your email
     },
     summary: {                     // Two or three sentances that describes your experience
         description: 'A driven software engineer with 5 years experience in Node.js' 
     },
     top_skills: {
                                    // 6 of your top skills.
         skills: [ 'Node.js', 'NPM', 'AWS', 'Git', 'React.js', 'Docker'] 
     },
     experience: {
         exp: [                     // Array of type JobPosition to show work history
             {
                 company: "Unsuccessful Technologies LLC",
                 position: "Consultant",
                 year_start: "2020",
                 year_end: "Present",
                 bullets: [
                     "Consult clients web & mobile application needs",
                     "Design, develop, test, deploy custom applications for unique business requirements"
                 ]
             },
             {
                 company: "Previous Company LLC",
                 position: "Software Engineer",
                 year_start: "2018",
                 year_end: "2020",
                 bullets: [
                    "Maintain software",
                    "Design automated tests using Jest.js"
                 ]
             }
         ]
     },
     education: {                   // Schooling information.  Adding support for multiple degrees in the future.
         school: "University of Central Florida",
         degree: "Bachelors of Science in Software Engineering",
         gpa: "4.00 - Summa Cum Laude Honors",
         grad_year: "2014"
     }
 }

const myResume = ResumePDF(resumeContent)

myResume.save('MyResume.pdf')
```
