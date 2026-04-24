package main

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"

	"calculator-web/internal/calc"
)

type calcRequest struct {
	Left  float64 `json:"left"`
	Right float64 `json:"right"`
	Op    string  `json:"op"`
}

type calcResponse struct {
	Result float64 `json:"result,omitempty"`
	Error  string  `json:"error,omitempty"`
}

func main() {
	mux := http.NewServeMux()
	mux.Handle("/", http.FileServer(http.Dir("./web")))
	mux.HandleFunc("POST /api/calc", calculateHandler)
	mux.HandleFunc("GET /healthz", healthHandler)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	server := &http.Server{
		Addr:    ":" + port,
		Handler: mux,
	}

	log.Printf("server started on :%s", port)
	if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatalf("server failed: %v", err)
	}
}

func healthHandler(w http.ResponseWriter, _ *http.Request) {
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte("ok"))
}

func calculateHandler(w http.ResponseWriter, r *http.Request) {
	var req calcRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, calcResponse{Error: "invalid request body"})
		return
	}

	result, err := calc.Compute(req.Left, req.Right, req.Op)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, calcResponse{Error: err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, calcResponse{Result: result})
}

func writeJSON(w http.ResponseWriter, code int, payload calcResponse) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(payload)
}
