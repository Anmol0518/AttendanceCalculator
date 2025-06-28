// DOM elements
const form = document.getElementById('attendanceForm');
const resultDiv = document.getElementById('result');
const chartCanvas = document.getElementById('attendanceChart');
const aiBox = document.getElementById('aiResponse');

let chartInstance = null;

// dealing with the inputs
form.addEventListener('submit', function (e) {
  e.preventDefault();

  const totalLectures = parseInt(document.getElementById('totalLectures').value);
  const attendedLectures = parseInt(document.getElementById('attendedLectures').value);

  
  if (isNaN(totalLectures) || isNaN(attendedLectures) || totalLectures <= 0 || attendedLectures < 0) {
    alert("Please enter valid positive numbers.");
    return;
  }

  if (attendedLectures > totalLectures) {
    alert("Attended lectures cannot exceed total lectures.");
    return;
  }

  // Calculating percentage
  const attendancePercentage = ((attendedLectures / totalLectures) * 100).toFixed(2);
  let resultMessage = `<strong>Attendance: ${attendancePercentage}%</strong><br>`;
  resultDiv.className = '';

  // Saving to local storage
  localStorage.setItem('total', totalLectures);
  localStorage.setItem('attended', attendedLectures);

  const lecturesRemaining = totalLectures - attendedLectures;
  const theoreticalCanMiss = Math.floor((attendedLectures - 0.75 * totalLectures) / 0.75);
  const actualCanMiss = Math.min(theoreticalCanMiss, lecturesRemaining);

  // logic for the result
  if (attendancePercentage >= 75) {
    resultDiv.classList.add("green");
    resultMessage += actualCanMiss > 0
      ? `You can skip <strong>${actualCanMiss}</strong> more lecture(s) and stay above 75%.`
      : `You're on the edge. Avoid skipping.`;
  } else {
    resultDiv.classList.add("red");
    const mustAttend = Math.ceil((0.75 * totalLectures - attendedLectures) / 0.25);
    resultMessage += `You must attend <strong>${mustAttend}</strong> more lecture(s) to reach 75%.`;
  }

  resultDiv.innerHTML = resultMessage;
  chartCanvas.style.display = 'block';
  drawChart(attendedLectures, totalLectures - attendedLectures);
});

//onloading
window.onload = () => {
  const savedTotal = localStorage.getItem('total');
  const savedAttended = localStorage.getItem('attended');

  if (savedTotal && savedAttended) {
    document.getElementById('totalLectures').value = savedTotal;
    document.getElementById('attendedLectures').value = savedAttended;
  }
};

// integrating a pie chart
function drawChart(attended, missed) {
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(chartCanvas, {
    type: 'pie',
    data: {
      labels: ['Attended', 'Missed'],
      datasets: [{
        data: [attended, missed],
        backgroundColor: ['#FEEA9A', '#E6C200'],
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#333',
            font: { weight: 'bold' }
          }
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const total = attended + missed;
              const value = context.parsed;
              const percent = ((value / total) * 100).toFixed(1);
              return `${context.label}: ${value} (${percent}%)`;
            }
          }
        }
      }
    }
  });
}

// handling the question
document.getElementById('skipPossible').addEventListener('click', () => {
  const totalLectures = parseInt(document.getElementById('totalLectures').value);
  const attendedLectures = parseInt(document.getElementById('attendedLectures').value);

  if (!totalLectures || !attendedLectures) {
    aiBox.innerText = "Please enter your attendance details first.";
    return;
  }

  const percentage = (attendedLectures / totalLectures) * 100;
  const remainingLectures = totalLectures - attendedLectures;

  let response = "";

  if (percentage >= 75 && remainingLectures >= 1) {
    response = "Yes, you can skip tomorrow and still stay safe!";
    aiBox.innerText = response;

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

  } else if (percentage >= 75 && remainingLectures === 0) {
    aiBox.innerText = "You've attended all lectures — nothing left to skip!";
  } else {
    aiBox.innerText = "No, you shouldn't skip. You're below 75%.";
  }
});
